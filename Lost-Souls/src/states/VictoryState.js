import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import SoundName from "../enums/SoundName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, keys, sounds, stateMachine, context } from "../globals.js";
import ParticleSystem from "../objects/ParticleSystem.js";

export default class VictoryState extends State {
	constructor() {
		super();

		// Particle system for celebration effects
		this.particles = new ParticleSystem();

		// Animation timers
		this.animationTimer = 0;
		this.victorySequence = 0;
		this.flashAlpha = 0;

		// Celebration effects
		this.confetti = [];
		this.lightRays = [];
		this.rings = [];

		// Floating golden orbs
		this.orbs = [];
	}

	initializeEffects() {
		// Golden confetti
		this.confetti = [];
		for (let i = 0; i < 50; i++) {
			this.confetti.push({
				x: Math.random() * CANVAS_WIDTH,
				y: -Math.random() * 300 - 50,
				size: Math.random() * 6 + 3,
				speed: Math.random() * 2 + 1,
				rotation: Math.random() * Math.PI * 2,
				rotationSpeed: (Math.random() - 0.5) * 0.2,
				sway: Math.random() * Math.PI * 2,
				swaySpeed: Math.random() * 2 + 1,
				swayAmount: Math.random() * 30 + 10,
				color: this.getGoldenColor(),
				delay: Math.random() * 1.5,
			});
		}

		// Light rays emanating from center
		this.lightRays = [];
		const rayCount = 12;
		for (let i = 0; i < rayCount; i++) {
			this.lightRays.push({
				angle: (i / rayCount) * Math.PI * 2,
				length: Math.random() * 100 + 150,
				width: Math.random() * 20 + 10,
				speed: Math.random() * 0.3 + 0.1,
				opacity: Math.random() * 0.3 + 0.1,
			});
		}

		// Expanding rings
		this.rings = [];
		for (let i = 0; i < 3; i++) {
			this.rings.push({
				radius: 0,
				maxRadius: 400 + i * 100,
				speed: 50 + i * 20,
				opacity: 0.3 - i * 0.08,
				delay: i * 0.5,
			});
		}

		// Floating orbs
		this.orbs = [];
		for (let i = 0; i < 12; i++) {
			const angle = (i / 12) * Math.PI * 2;
			this.orbs.push({
				baseX: CANVAS_WIDTH / 2 + Math.cos(angle) * 150,
				baseY: CANVAS_HEIGHT / 2 + Math.sin(angle) * 80,
				size: Math.random() * 8 + 4,
				phase: Math.random() * Math.PI * 2,
				phaseSpeed: Math.random() * 1 + 0.5,
				floatRange: Math.random() * 20 + 10,
				opacity: Math.random() * 0.4 + 0.3,
			});
		}
	}

	getGoldenColor() {
		const colors = [
			{ r: 255, g: 215, b: 0 },   // Gold
			{ r: 255, g: 200, b: 50 },  // Light gold
			{ r: 255, g: 180, b: 0 },   // Orange gold
			{ r: 255, g: 235, b: 100 }, // Pale gold
			{ r: 255, g: 255, b: 200 }, // White gold
		];
		return colors[Math.floor(Math.random() * colors.length)];
	}

	enter(parameters) {
		this.map = parameters.map;
		this.animationTimer = 0;
		this.victorySequence = 0;
		this.flashAlpha = 1;

		sounds.play(SoundName.Sword_Swing);
		sounds.stop(SoundName.Sword_Swing);

		// Setup door
		this.map.door.isSolid = true;
		this.map.door.isCollidable = true;
		this.map.door.shouldRender = true;

		// Initialize effects
		this.particles.clear();
		this.initializeEffects();

		// Initial burst
		this.particles.burst('magic', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 30, {
			color: { r: 255, g: 215, b: 0 },
		});
	}

	update(dt) {
		this.animationTimer += dt;

		// Victory sequence progression
		if (this.victorySequence < 1) {
			this.victorySequence += dt * 0.6;
		}

		// Decay flash
		this.flashAlpha = Math.max(0, this.flashAlpha - dt * 2);

		// Update particles
		this.particles.update(dt);

		// Emit celebration particles
		if (Math.random() < dt * 10) {
			const angle = Math.random() * Math.PI * 2;
			const dist = Math.random() * 200 + 50;
			this.particles.emit('ember',
				CANVAS_WIDTH / 2 + Math.cos(angle) * dist,
				CANVAS_HEIGHT / 2 + Math.sin(angle) * dist,
				1,
				{ color: { r: 255, g: 200, b: 100 } }
			);
		}

		// Update confetti
		this.confetti.forEach(c => {
			if (this.animationTimer > c.delay) {
				c.y += c.speed;
				c.rotation += c.rotationSpeed;
				c.sway += c.swaySpeed * dt;
				c.x += Math.sin(c.sway) * 0.5;

				if (c.y > CANVAS_HEIGHT + 50) {
					c.y = -50;
					c.x = Math.random() * CANVAS_WIDTH;
				}
			}
		});

		// Update light rays
		this.lightRays.forEach(ray => {
			ray.angle += ray.speed * dt;
		});

		// Update rings
		this.rings.forEach(ring => {
			if (this.animationTimer > ring.delay) {
				ring.radius += ring.speed * dt;
				if (ring.radius > ring.maxRadius) {
					ring.radius = 0;
				}
			}
		});

		// Update orbs
		this.orbs.forEach(orb => {
			orb.phase += orb.phaseSpeed * dt;
		});

		// Handle input after delay
		if (this.animationTimer > 1 && keys.Enter) {
			keys.Enter = false;
			stateMachine.change(GameStateName.Play, {
				map: this.map,
				fromVictory: true,
			});
		}
	}

	render(context) {
		context.save();

		// Render game world
		this.map.render();

		// Victory overlay
		this.renderVictoryOverlay(context);

		// Render light rays (behind text)
		this.renderLightRays(context);

		// Render expanding rings
		this.renderRings(context);

		// Render particles
		this.particles.render();

		// Render confetti
		this.renderConfetti(context);

		// Render floating orbs
		this.renderOrbs(context);

		// Render victory panel
		this.renderVictoryPanel(context);

		// Flash effect
		if (this.flashAlpha > 0) {
			context.fillStyle = `rgba(255, 235, 180, ${this.flashAlpha * 0.7})`;
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		}

		context.restore();
	}

	renderVictoryOverlay(context) {
		// Light golden overlay
		const progress = Math.min(1, this.victorySequence * 1.5);
		context.fillStyle = `rgba(0, 0, 0, ${0.3 + progress * 0.2})`;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Golden vignette
		const gradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.1,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.9
		);
		gradient.addColorStop(0, `rgba(50, 40, 20, 0)`);
		gradient.addColorStop(0.5, `rgba(30, 20, 10, ${progress * 0.3})`);
		gradient.addColorStop(1, `rgba(20, 15, 5, ${progress * 0.6})`);

		context.fillStyle = gradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Subtle golden glow from center
		const glowGradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 300
		);
		glowGradient.addColorStop(0, `rgba(255, 220, 100, ${progress * 0.15})`);
		glowGradient.addColorStop(0.5, `rgba(255, 200, 80, ${progress * 0.08})`);
		glowGradient.addColorStop(1, 'rgba(255, 180, 50, 0)');

		context.fillStyle = glowGradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	renderLightRays(context) {
		const centerX = CANVAS_WIDTH / 2;
		const centerY = CANVAS_HEIGHT / 2 - 30;
		const progress = Math.min(1, this.victorySequence);

		this.lightRays.forEach(ray => {
			const alpha = ray.opacity * progress;
			if (alpha <= 0) return;

			context.save();
			context.translate(centerX, centerY);
			context.rotate(ray.angle);

			const gradient = context.createLinearGradient(0, 0, ray.length, 0);
			gradient.addColorStop(0, `rgba(255, 220, 100, ${alpha})`);
			gradient.addColorStop(0.5, `rgba(255, 200, 80, ${alpha * 0.5})`);
			gradient.addColorStop(1, 'rgba(255, 180, 50, 0)');

			context.fillStyle = gradient;
			context.beginPath();
			context.moveTo(0, 0);
			context.lineTo(ray.length, ray.width / 2);
			context.lineTo(ray.length, -ray.width / 2);
			context.closePath();
			context.fill();

			context.restore();
		});
	}

	renderRings(context) {
		const centerX = CANVAS_WIDTH / 2;
		const centerY = CANVAS_HEIGHT / 2;

		this.rings.forEach(ring => {
			if (ring.radius <= 0) return;

			const progress = ring.radius / ring.maxRadius;
			const alpha = ring.opacity * (1 - progress);

			context.strokeStyle = `rgba(255, 215, 100, ${alpha})`;
			context.lineWidth = 2;
			context.beginPath();
			context.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
			context.stroke();

			// Inner glow ring
			context.strokeStyle = `rgba(255, 235, 150, ${alpha * 0.5})`;
			context.lineWidth = 4;
			context.beginPath();
			context.arc(centerX, centerY, ring.radius * 0.95, 0, Math.PI * 2);
			context.stroke();
		});
	}

	renderConfetti(context) {
		this.confetti.forEach(c => {
			if (this.animationTimer < c.delay) return;

			context.save();
			context.translate(c.x, c.y);
			context.rotate(c.rotation);

			// Confetti shimmer
			const shimmer = 0.6 + Math.sin(this.animationTimer * 5 + c.sway) * 0.4;
			context.globalAlpha = shimmer;

			// Draw confetti piece
			context.fillStyle = `rgb(${c.color.r}, ${c.color.g}, ${c.color.b})`;
			context.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);

			// Highlight
			context.fillStyle = 'rgba(255, 255, 255, 0.5)';
			context.fillRect(-c.size / 2, -c.size / 4, c.size / 2, c.size / 4);

			context.restore();
		});

		context.globalAlpha = 1;
	}

	renderOrbs(context) {
		this.orbs.forEach(orb => {
			const x = orb.baseX;
			const y = orb.baseY + Math.sin(orb.phase) * orb.floatRange;
			const alpha = orb.opacity * (0.6 + Math.sin(orb.phase * 2) * 0.4);

			context.globalAlpha = alpha * Math.min(1, this.victorySequence * 2);

			// Outer glow
			const gradient = context.createRadialGradient(x, y, 0, x, y, orb.size * 3);
			gradient.addColorStop(0, 'rgba(255, 220, 100, 0.8)');
			gradient.addColorStop(0.4, 'rgba(255, 200, 50, 0.4)');
			gradient.addColorStop(1, 'rgba(255, 180, 0, 0)');

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(x, y, orb.size * 3, 0, Math.PI * 2);
			context.fill();

			// Core
			context.fillStyle = 'rgba(255, 255, 220, 0.9)';
			context.beginPath();
			context.arc(x, y, orb.size, 0, Math.PI * 2);
			context.fill();
		});

		context.globalAlpha = 1;
	}

	renderVictoryPanel(context) {
		const panelProgress = Math.min(1, Math.max(0, (this.victorySequence - 0.2) * 1.5));
		if (panelProgress <= 0) return;

		const centerY = CANVAS_HEIGHT / 2;
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		// "VICTORY" text
		const scale = 0.7 + panelProgress * 0.3;
		const titleY = centerY - 50;

		context.save();
		context.translate(CANVAS_WIDTH / 2, titleY);
		context.scale(scale, scale);
		context.translate(-CANVAS_WIDTH / 2, -titleY);

		// Deep golden shadow
		context.font = '80px Dungeon';
		context.globalAlpha = panelProgress * 0.6;
		context.fillStyle = 'rgba(100, 70, 0, 0.9)';
		context.fillText('VICTORY', CANVAS_WIDTH / 2 + 4, titleY + 4);

		// Outer golden glow
		const pulse = 0.8 + Math.sin(this.animationTimer * 3) * 0.2;
		context.globalAlpha = panelProgress * pulse;
		context.shadowBlur = 50;
		context.shadowColor = 'rgba(255, 200, 0, 1)';
		context.fillStyle = 'rgba(255, 200, 50, 0.6)';
		context.fillText('VICTORY', CANVAS_WIDTH / 2, titleY);

		// Inner bright glow
		context.shadowBlur = 30;
		context.shadowColor = 'rgba(255, 235, 100, 1)';
		context.fillStyle = 'rgba(255, 235, 100, 0.8)';
		context.fillText('VICTORY', CANVAS_WIDTH / 2, titleY);

		// Main text
		context.globalAlpha = panelProgress;
		context.shadowBlur = 15;
		context.shadowColor = 'rgba(255, 255, 200, 1)';
		context.fillStyle = '#ffffd0';
		context.fillText('VICTORY', CANVAS_WIDTH / 2, titleY);

		context.restore();

		// Subtitle
		const subtitleProgress = Math.min(1, Math.max(0, (this.victorySequence - 0.4) * 2));
		if (subtitleProgress > 0) {
			context.globalAlpha = subtitleProgress;
			context.font = '22px Dungeon';
			context.shadowBlur = 8;
			context.shadowColor = 'rgba(255, 200, 100, 0.8)';
			context.fillStyle = '#ffe4b3';
			context.fillText('Area Cleared!', CANVAS_WIDTH / 2, centerY + 10);
		}

		// Score display
		const scoreProgress = Math.min(1, Math.max(0, (this.victorySequence - 0.5) * 2));
		if (scoreProgress > 0) {
			context.globalAlpha = scoreProgress;

			// Decorative lines
			const lineWidth = 200;
			const lineY = centerY + 40;
			const lineGrad = context.createLinearGradient(
				CANVAS_WIDTH / 2 - lineWidth / 2, lineY,
				CANVAS_WIDTH / 2 + lineWidth / 2, lineY
			);
			lineGrad.addColorStop(0, 'rgba(200, 160, 80, 0)');
			lineGrad.addColorStop(0.5, 'rgba(220, 180, 100, 0.8)');
			lineGrad.addColorStop(1, 'rgba(200, 160, 80, 0)');
			context.strokeStyle = lineGrad;
			context.lineWidth = 1;
			context.beginPath();
			context.moveTo(CANVAS_WIDTH / 2 - lineWidth / 2, lineY);
			context.lineTo(CANVAS_WIDTH / 2 + lineWidth / 2, lineY);
			context.stroke();

			// Score label
			context.font = '16px Dungeon';
			context.shadowBlur = 4;
			context.shadowColor = 'rgba(0, 0, 0, 0.6)';
			context.fillStyle = '#c4a060';
			context.fillText('Souls Gathered', CANVAS_WIDTH / 2, centerY + 65);

			// Score value
			context.font = '48px Dungeon';
			context.shadowBlur = 12;
			context.shadowColor = 'rgba(255, 200, 100, 0.8)';
			context.fillStyle = '#ffd966';
			context.fillText(this.map.player.score, CANVAS_WIDTH / 2, centerY + 105);
		}

		// Continue prompt
		const promptProgress = Math.min(1, Math.max(0, (this.victorySequence - 0.7) * 2.5));
		if (promptProgress > 0) {
			const blink = 0.6 + Math.sin(this.animationTimer * 3) * 0.4;
			context.globalAlpha = promptProgress * blink;
			context.font = '20px Dungeon';
			context.shadowBlur = 6;
			context.shadowColor = 'rgba(255, 200, 100, 0.5)';
			context.fillStyle = '#ddc080';
			context.fillText('Press Enter to Continue', CANVAS_WIDTH / 2, centerY + 160);
		}

		context.globalAlpha = 1;
		context.shadowBlur = 0;
	}
}
