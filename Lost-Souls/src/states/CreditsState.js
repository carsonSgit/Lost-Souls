import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	keys,
	sounds,
	stateMachine,
	context,
} from "../globals.js";
import SoundName from "../enums/SoundName.js";
import ParticleSystem from "../objects/ParticleSystem.js";

export default class CreditsState extends State {
	constructor() {
		super();

		// Particle system
		this.particles = new ParticleSystem();

		// Animation
		this.animationTimer = 0;
		this.scrollOffset = 0;
		this.fadeIn = 1;

		// Credits data
		this.credits = [
			{ type: 'title', text: 'Lost Souls' },
			{ type: 'subtitle', text: 'A Dark Fantasy Adventure' },
			{ type: 'spacer' },
			{ type: 'header', text: 'Development' },
			{ type: 'credit', role: 'Programming', names: ['NoahGJAC', 'carsonSgit'] },
			{ type: 'spacer' },
			{ type: 'header', text: 'Art & Visuals' },
			{ type: 'credit', role: 'Character Sprites', names: ['Szadi art.', 'LuizMelo'] },
			{ type: 'credit', role: 'Tilesets & Backgrounds', names: ['ansimuz', 'chierit', 'brullov'] },
			{ type: 'spacer' },
			{ type: 'header', text: 'Audio' },
			{ type: 'credit', role: 'Music & Sound Effects', names: ['Leohpaz', 'xDeviruchi'] },
			{ type: 'spacer' },
			{ type: 'header', text: 'Typography' },
			{ type: 'credit', role: 'Fonts', names: ['vrtxrry', 'somepx', 'GGBotNet'] },
			{ type: 'spacer' },
			{ type: 'spacer' },
			{ type: 'thanks', text: 'Thank you for playing!' },
		];

		// Floating souls for decoration
		this.souls = [];
	}

	initializeEffects() {
		this.particles.clear();

		// Initialize floating souls
		this.souls = [];
		for (let i = 0; i < 10; i++) {
			this.souls.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * CANVAS_HEIGHT,
				size: Math.random() * 4 + 2,
				speed: Math.random() * 0.2 + 0.1,
				phase: Math.random() * Math.PI * 2,
				phaseSpeed: Math.random() * 1 + 0.5,
				waveAmplitude: Math.random() * 20 + 10,
				opacity: Math.random() * 0.3 + 0.1,
			});
		}
	}

	enter(parameters) {
		sounds.stop(SoundName.VillageTheme);
		sounds.play(SoundName.CreditsTheme);

		this.map = parameters.map;
		this.animationTimer = 0;
		this.scrollOffset = 0;
		this.fadeIn = 1;

		this.initializeEffects();
	}

	exit() {
		sounds.stop(SoundName.CreditsTheme);
	}

	update(dt) {
		this.map.update(dt);
		this.animationTimer += dt;

		// Fade in
		if (this.fadeIn > 0) {
			this.fadeIn -= dt * 1.5;
		}

		// Update particles
		this.particles.update(dt);

		// Emit ambient particles
		if (Math.random() < dt * 3) {
			this.particles.emit('ember', Math.random() * CANVAS_WIDTH, CANVAS_HEIGHT + 10, 1, {
				color: { r: 255, g: 180, b: 80 },
			});
		}

		// Update floating souls
		this.souls.forEach(soul => {
			soul.y -= soul.speed;
			soul.phase += soul.phaseSpeed * dt;

			if (soul.y < -20) {
				soul.y = CANVAS_HEIGHT + 20;
				soul.x = Math.random() * CANVAS_WIDTH;
			}
		});

		// Handle exit
		if (keys.Enter) {
			keys.Enter = false;
			stateMachine.change(GameStateName.TitleScreen);
		}
	}

	render(context) {
		context.save();

		// Render game background
		this.map.render();

		// Dark overlay
		context.fillStyle = 'rgba(0, 0, 0, 0.5)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Render floating souls
		this.renderSouls(context);

		// Render particles
		this.particles.render();

		// Render vignette
		this.renderVignette(context);

		// Render credits content
		this.renderCredits(context);

		// Fade in overlay
		if (this.fadeIn > 0) {
			context.fillStyle = `rgba(0, 0, 0, ${this.fadeIn})`;
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		}

		context.restore();
	}

	renderSouls(context) {
		this.souls.forEach(soul => {
			const x = soul.x + Math.sin(soul.phase) * soul.waveAmplitude;
			const alpha = soul.opacity * (0.5 + Math.sin(soul.phase * 2) * 0.5);

			context.globalAlpha = alpha;

			// Glow
			const gradient = context.createRadialGradient(x, soul.y, 0, x, soul.y, soul.size * 4);
			gradient.addColorStop(0, 'rgba(180, 200, 255, 0.8)');
			gradient.addColorStop(0.3, 'rgba(150, 180, 255, 0.4)');
			gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
			context.fillStyle = gradient;
			context.beginPath();
			context.arc(x, soul.y, soul.size * 4, 0, Math.PI * 2);
			context.fill();

			// Core
			context.fillStyle = 'rgba(220, 230, 255, 0.9)';
			context.beginPath();
			context.arc(x, soul.y, soul.size, 0, Math.PI * 2);
			context.fill();
		});

		context.globalAlpha = 1;
	}

	renderVignette(context) {
		const gradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.2,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.9
		);
		gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
		gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.6)');
		gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');

		context.fillStyle = gradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	renderCredits(context) {
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		let y = CANVAS_HEIGHT * 0.12;

		this.credits.forEach((item, index) => {
			const delay = index * 0.1;
			const itemAlpha = Math.min(1, Math.max(0, (this.animationTimer - delay) * 2));

			if (itemAlpha <= 0) return;

			context.globalAlpha = itemAlpha;

			switch (item.type) {
				case 'title':
					this.renderTitle(context, item.text, y);
					y += 50;
					break;

				case 'subtitle':
					context.font = '18px Dungeon';
					context.fillStyle = '#c4a070';
					context.shadowBlur = 8;
					context.shadowColor = 'rgba(200, 160, 100, 0.5)';
					context.fillText(item.text, CANVAS_WIDTH / 2, y);
					context.shadowBlur = 0;
					y += 30;
					break;

				case 'header':
					context.font = '26px Dungeon';
					context.shadowBlur = 10;
					context.shadowColor = 'rgba(255, 200, 100, 0.6)';
					context.fillStyle = '#ffd966';
					context.fillText(item.text, CANVAS_WIDTH / 2, y);
					context.shadowBlur = 0;

					// Decorative line
					const lineWidth = 150;
					const lineGrad = context.createLinearGradient(
						CANVAS_WIDTH / 2 - lineWidth / 2, y + 15,
						CANVAS_WIDTH / 2 + lineWidth / 2, y + 15
					);
					lineGrad.addColorStop(0, 'rgba(200, 160, 80, 0)');
					lineGrad.addColorStop(0.5, 'rgba(200, 160, 80, 0.6)');
					lineGrad.addColorStop(1, 'rgba(200, 160, 80, 0)');
					context.strokeStyle = lineGrad;
					context.lineWidth = 1;
					context.beginPath();
					context.moveTo(CANVAS_WIDTH / 2 - lineWidth / 2, y + 18);
					context.lineTo(CANVAS_WIDTH / 2 + lineWidth / 2, y + 18);
					context.stroke();

					y += 40;
					break;

				case 'credit':
					// Role
					context.font = '14px Dungeon';
					context.fillStyle = '#888888';
					context.fillText(item.role, CANVAS_WIDTH / 2, y);
					y += 18;

					// Names
					context.font = '20px Dungeon';
					context.fillStyle = '#e8e8e8';
					context.shadowBlur = 4;
					context.shadowColor = 'rgba(0, 0, 0, 0.6)';
					item.names.forEach(name => {
						context.fillText(name, CANVAS_WIDTH / 2, y);
						y += 22;
					});
					context.shadowBlur = 0;
					break;

				case 'spacer':
					y += 25;
					break;

				case 'thanks':
					const pulse = 0.8 + Math.sin(this.animationTimer * 2) * 0.2;
					context.font = '28px Dungeon';
					context.shadowBlur = 15;
					context.shadowColor = `rgba(255, 200, 100, ${pulse})`;
					context.fillStyle = '#fff5dc';
					context.fillText(item.text, CANVAS_WIDTH / 2, y);
					context.shadowBlur = 0;
					y += 40;
					break;
			}
		});

		// Exit prompt at bottom
		const promptAlpha = Math.min(1, Math.max(0, this.animationTimer - 2));
		if (promptAlpha > 0) {
			const blink = 0.5 + Math.sin(this.animationTimer * 3) * 0.5;
			context.globalAlpha = promptAlpha * blink;
			context.font = '16px Dungeon';
			context.fillStyle = '#888888';
			context.fillText('Press Enter to Return', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
		}

		context.globalAlpha = 1;
		context.shadowBlur = 0;
	}

	renderTitle(context, text, y) {
		const pulse = Math.sin(this.animationTimer * 1.5) * 0.1 + 1;

		// Deep shadow
		context.font = '56px Dungeon';
		context.globalAlpha = 0.5;
		context.fillStyle = 'rgba(0, 0, 0, 0.8)';
		context.fillText(text, CANVAS_WIDTH / 2 + 4, y + 4);

		// Outer fire glow
		context.globalAlpha = pulse * 0.6;
		context.shadowBlur = 35;
		context.shadowColor = 'rgba(200, 80, 30, 1)';
		context.fillStyle = 'rgba(200, 80, 30, 0.5)';
		context.fillText(text, CANVAS_WIDTH / 2, y);

		// Inner glow
		context.shadowBlur = 20;
		context.shadowColor = 'rgba(255, 150, 80, 1)';
		context.fillStyle = 'rgba(255, 150, 80, 0.7)';
		context.fillText(text, CANVAS_WIDTH / 2, y);

		// Main title
		context.globalAlpha = 1;
		context.shadowBlur = 12;
		context.shadowColor = 'rgba(255, 200, 120, 0.9)';
		context.fillStyle = '#fff5e6';
		context.fillText(text, CANVAS_WIDTH / 2, y);

		context.shadowBlur = 0;
	}
}
