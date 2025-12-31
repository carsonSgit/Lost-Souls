import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, keys, stateMachine, sounds, context } from "../globals.js";
import SoundName from "../enums/SoundName.js";
import ParticleSystem from "../objects/ParticleSystem.js";

export default class GameOverState extends State {
	constructor() {
		super();

		// Particle system for dramatic death effects
		this.particles = new ParticleSystem();

		// Animation timers
		this.animationTimer = 0;
		this.deathSequence = 0; // 0-1 for staged reveal
		this.shakeIntensity = 0;
		this.flashAlpha = 0;

		// Blood drip effect
		this.bloodDrips = [];

		// Floating skull positions
		this.skulls = [];
	}

	initializeEffects() {
		// Create blood drips falling down screen
		this.bloodDrips = [];
		for (let i = 0; i < 15; i++) {
			this.bloodDrips.push({
				x: Math.random() * CANVAS_WIDTH,
				y: -Math.random() * 200,
				speed: Math.random() * 1.5 + 0.5,
				length: Math.random() * 40 + 20,
				delay: Math.random() * 2,
				opacity: Math.random() * 0.4 + 0.2,
			});
		}

		// Floating skull decorations
		this.skulls = [];
		for (let i = 0; i < 5; i++) {
			this.skulls.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * CANVAS_HEIGHT,
				size: Math.random() * 15 + 10,
				phase: Math.random() * Math.PI * 2,
				speed: Math.random() * 0.5 + 0.3,
				opacity: Math.random() * 0.15 + 0.05,
			});
		}
	}

	enter(parameters) {
		this.map = parameters.map;
		this.animationTimer = 0;
		this.deathSequence = 0;
		this.shakeIntensity = 15;
		this.flashAlpha = 1;

		// Clear and initialize effects
		this.particles.clear();
		this.initializeEffects();

		// Initial death impact particles
		this.particles.burst('impact', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 20, {
			color: { r: 150, g: 20, b: 20 },
		});
	}

	exit() {
		if (this.map.collisionLayer === this.map.caveCollisionLayer) {
			sounds.stop(SoundName.CaveTheme);
		}
		if (this.map.collisionLayer === this.map.bossCollisionLayer) {
			sounds.stop(SoundName.BossFight);
		}
	}

	update(dt) {
		this.animationTimer += dt;

		// Death sequence progression
		if (this.deathSequence < 1) {
			this.deathSequence += dt * 0.5;
		}

		// Decay shake and flash
		this.shakeIntensity *= 0.95;
		this.flashAlpha = Math.max(0, this.flashAlpha - dt * 3);

		// Update particles
		this.particles.update(dt);

		// Emit falling ash/embers
		if (Math.random() < dt * 5) {
			this.particles.emit('ash', Math.random() * CANVAS_WIDTH, -20, 1, {
				windSpeed: -0.5,
			});
		}

		// Emit blood particles occasionally
		if (Math.random() < dt * 2) {
			this.particles.emit('blood',
				Math.random() * CANVAS_WIDTH,
				Math.random() * CANVAS_HEIGHT * 0.3,
				1
			);
		}

		// Update blood drips
		this.bloodDrips.forEach(drip => {
			if (this.animationTimer > drip.delay) {
				drip.y += drip.speed;
				if (drip.y > CANVAS_HEIGHT + drip.length) {
					drip.y = -drip.length;
					drip.x = Math.random() * CANVAS_WIDTH;
				}
			}
		});

		// Update skulls
		this.skulls.forEach(skull => {
			skull.phase += skull.speed * dt;
			skull.y -= 0.1;
			if (skull.y < -skull.size * 2) {
				skull.y = CANVAS_HEIGHT + skull.size * 2;
				skull.x = Math.random() * CANVAS_WIDTH;
			}
		});

		// Handle input after delay
		if (this.animationTimer > 1 && keys.Enter) {
			keys.Enter = false;
			stateMachine.change(GameStateName.TitleScreen);
		}
	}

	render(context) {
		context.save();

		// Apply screen shake
		if (this.shakeIntensity > 0.1) {
			context.translate(
				(Math.random() - 0.5) * this.shakeIntensity,
				(Math.random() - 0.5) * this.shakeIntensity
			);
		}

		// Render game world (darkened)
		this.map.render();

		// Death overlay
		this.renderDeathOverlay(context);

		// Render particles
		this.particles.render();

		// Render blood drips
		this.renderBloodDrips(context);

		// Render floating skulls
		this.renderSkulls(context);

		// Render death panel
		this.renderDeathPanel(context);

		// Flash effect
		if (this.flashAlpha > 0) {
			context.fillStyle = `rgba(150, 30, 30, ${this.flashAlpha})`;
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		}

		context.restore();
	}

	renderDeathOverlay(context) {
		// Deep darkness overlay
		const progress = Math.min(1, this.deathSequence * 1.5);
		context.fillStyle = `rgba(0, 0, 0, ${0.5 + progress * 0.3})`;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Red vignette of death
		const gradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.1,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.9
		);
		gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		gradient.addColorStop(0.4, `rgba(40, 0, 0, ${progress * 0.4})`);
		gradient.addColorStop(0.7, `rgba(80, 10, 10, ${progress * 0.6})`);
		gradient.addColorStop(1, `rgba(100, 20, 20, ${progress * 0.9})`);

		context.fillStyle = gradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Subtle red fog at bottom
		const fogGradient = context.createLinearGradient(0, CANVAS_HEIGHT * 0.6, 0, CANVAS_HEIGHT);
		fogGradient.addColorStop(0, 'rgba(60, 10, 10, 0)');
		fogGradient.addColorStop(1, `rgba(80, 15, 15, ${progress * 0.4})`);
		context.fillStyle = fogGradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	renderBloodDrips(context) {
		context.lineCap = 'round';

		this.bloodDrips.forEach(drip => {
			if (this.animationTimer < drip.delay) return;

			const gradient = context.createLinearGradient(drip.x, drip.y, drip.x, drip.y + drip.length);
			gradient.addColorStop(0, `rgba(100, 15, 15, ${drip.opacity})`);
			gradient.addColorStop(0.5, `rgba(120, 20, 20, ${drip.opacity * 0.8})`);
			gradient.addColorStop(1, `rgba(80, 10, 10, 0)`);

			context.strokeStyle = gradient;
			context.lineWidth = 3;
			context.beginPath();
			context.moveTo(drip.x, drip.y);
			context.lineTo(drip.x, drip.y + drip.length);
			context.stroke();
		});
	}

	renderSkulls(context) {
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		this.skulls.forEach(skull => {
			const float = Math.sin(skull.phase) * 10;
			const alpha = skull.opacity * (0.5 + Math.sin(skull.phase * 2) * 0.5);

			context.globalAlpha = alpha;
			context.font = `${skull.size}px Dungeon`;
			context.fillStyle = 'rgba(100, 80, 80, 1)';
			context.fillText('*', skull.x, skull.y + float);
		});

		context.globalAlpha = 1;
	}

	renderDeathPanel(context) {
		const panelProgress = Math.min(1, Math.max(0, (this.deathSequence - 0.3) * 2));
		if (panelProgress <= 0) return;

		const centerY = CANVAS_HEIGHT / 2;
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		// "YOU DIED" text with dramatic effect
		const scale = 0.5 + panelProgress * 0.5;
		const titleY = centerY - 40;

		context.save();
		context.translate(CANVAS_WIDTH / 2, titleY);
		context.scale(scale, scale);
		context.translate(-CANVAS_WIDTH / 2, -titleY);

		// Deep blood shadow
		context.font = '72px Dungeon';
		context.globalAlpha = panelProgress * 0.7;
		context.fillStyle = 'rgba(60, 0, 0, 0.9)';
		context.fillText('YOU DIED', CANVAS_WIDTH / 2 + 5, titleY + 5);

		// Outer blood glow
		const pulse = 0.7 + Math.sin(this.animationTimer * 2) * 0.3;
		context.globalAlpha = panelProgress * pulse * 0.8;
		context.shadowBlur = 40;
		context.shadowColor = 'rgba(180, 30, 30, 1)';
		context.fillStyle = 'rgba(150, 20, 20, 0.6)';
		context.fillText('YOU DIED', CANVAS_WIDTH / 2, titleY);

		// Inner glow
		context.shadowBlur = 25;
		context.shadowColor = 'rgba(220, 60, 60, 1)';
		context.fillStyle = 'rgba(200, 40, 40, 0.8)';
		context.fillText('YOU DIED', CANVAS_WIDTH / 2, titleY);

		// Main text
		context.globalAlpha = panelProgress;
		context.shadowBlur = 15;
		context.shadowColor = 'rgba(255, 80, 80, 0.9)';
		context.fillStyle = '#cc3333';
		context.fillText('YOU DIED', CANVAS_WIDTH / 2, titleY);

		context.restore();

		// Score display with fade-in
		const scoreProgress = Math.min(1, Math.max(0, (this.deathSequence - 0.6) * 2));
		if (scoreProgress > 0) {
			context.globalAlpha = scoreProgress;

			// Decorative line
			const lineWidth = 200;
			const lineY = centerY + 20;
			const lineGrad = context.createLinearGradient(
				CANVAS_WIDTH / 2 - lineWidth / 2, lineY,
				CANVAS_WIDTH / 2 + lineWidth / 2, lineY
			);
			lineGrad.addColorStop(0, 'rgba(100, 30, 30, 0)');
			lineGrad.addColorStop(0.5, 'rgba(120, 40, 40, 0.8)');
			lineGrad.addColorStop(1, 'rgba(100, 30, 30, 0)');
			context.strokeStyle = lineGrad;
			context.lineWidth = 1;
			context.beginPath();
			context.moveTo(CANVAS_WIDTH / 2 - lineWidth / 2, lineY);
			context.lineTo(CANVAS_WIDTH / 2 + lineWidth / 2, lineY);
			context.stroke();

			// Souls lost text
			context.font = '18px Dungeon';
			context.shadowBlur = 5;
			context.shadowColor = 'rgba(0, 0, 0, 0.8)';
			context.fillStyle = '#996666';
			context.fillText('Souls Collected', CANVAS_WIDTH / 2, centerY + 50);

			// Score number
			context.font = '42px Dungeon';
			context.shadowBlur = 10;
			context.shadowColor = 'rgba(255, 150, 100, 0.5)';
			context.fillStyle = '#ffaa66';
			context.fillText(this.map.player.score, CANVAS_WIDTH / 2, centerY + 85);

			// High score comparison
			if (this.map.player.score >= this.map.player.highScore && this.map.player.score > 0) {
				context.font = '16px Dungeon';
				context.fillStyle = '#ffdd44';
				context.shadowColor = 'rgba(255, 220, 100, 0.8)';
				context.fillText('NEW HIGH SCORE!', CANVAS_WIDTH / 2, centerY + 115);
			} else {
				context.font = '14px Dungeon';
				context.fillStyle = '#887766';
				context.shadowBlur = 3;
				context.fillText(`Best: ${this.map.player.highScore}`, CANVAS_WIDTH / 2, centerY + 115);
			}
		}

		// Continue prompt
		const promptProgress = Math.min(1, Math.max(0, (this.deathSequence - 0.8) * 3));
		if (promptProgress > 0) {
			const blink = Math.sin(this.animationTimer * 3) * 0.3 + 0.7;
			context.globalAlpha = promptProgress * blink;
			context.font = '18px Dungeon';
			context.shadowBlur = 5;
			context.shadowColor = 'rgba(0, 0, 0, 0.6)';
			context.fillStyle = '#888888';
			context.fillText('Press Enter to Return', CANVAS_WIDTH / 2, centerY + 160);
		}

		context.globalAlpha = 1;
		context.shadowBlur = 0;
	}
}
