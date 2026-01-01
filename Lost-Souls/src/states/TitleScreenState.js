import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import Map from "../../lib/Map.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	VILLAGE_BACKGROUND_IMAGE_SRC,
	backgroundImage,
	keys,
	context,
	sounds,
	stateMachine,
} from "../globals.js";
import SoundName from "../enums/SoundName.js";
import ParticleSystem from "../objects/ParticleSystem.js";

export default class TitleScreenState extends State {
	constructor(caveDefinition, villageDefinition, bossDefinition) {
		super();

		this.caveDefinition = caveDefinition;
		this.villageDefinition = villageDefinition;
		this.bossDefinition = bossDefinition;
		this.map = new Map(caveDefinition, villageDefinition, bossDefinition);

		// Menu system
		this.menuOptions = [
			{ id: 'play', label: 'Begin Journey', description: 'Enter the realm of lost souls' },
			{ id: 'credits', label: 'Credits', description: 'Those who forged this tale' },
		];
		this.selectedIndex = 0;

		// Particle system for atmospheric effects
		this.particles = new ParticleSystem();

		// Animation timers
		this.animationTimer = 0;
		this.titleFloat = 0;
		this.menuAppearDelay = 0.5;
		this.menuAppearTimer = 0;

		// Decorative floating souls
		this.souls = [];
		this.initializeSouls();

		// Torch flames (decorative)
		this.torchFlames = [
			{ x: CANVAS_WIDTH * 0.15, y: CANVAS_HEIGHT * 0.6, phase: 0 },
			{ x: CANVAS_WIDTH * 0.85, y: CANVAS_HEIGHT * 0.6, phase: Math.PI },
		];

		// Title glow effect
		this.titleGlowPhase = 0;

		// Fade in
		this.fadeIn = 1;
	}

	initializeSouls() {
		for (let i = 0; i < 8; i++) {
			this.souls.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * CANVAS_HEIGHT,
				size: Math.random() * 4 + 2,
				speed: Math.random() * 0.3 + 0.1,
				wavePhase: Math.random() * Math.PI * 2,
				waveSpeed: Math.random() * 1 + 0.5,
				waveAmplitude: Math.random() * 30 + 10,
				opacity: Math.random() * 0.3 + 0.2,
			});
		}
	}

	enter() {
		sounds.stop(SoundName.CaveTheme);
		this.map = new Map(this.caveDefinition, this.villageDefinition, this.bossDefinition);
		sounds.play(SoundName.VillageTheme);
		backgroundImage.src = VILLAGE_BACKGROUND_IMAGE_SRC;

		// Reset state
		this.selectedIndex = 0;
		this.menuAppearTimer = 0;
		this.fadeIn = 1;

		// Start emitting ambient particles
		this.particles.clear();
	}

	exit() {
		sounds.stop(SoundName.VillageTheme);
	}

	update(dt) {
		this.map.update(dt);
		this.animationTimer += dt;
		this.titleFloat = Math.sin(this.animationTimer * 1.2) * 5;
		this.titleGlowPhase += dt * 2;

		// Fade in
		if (this.fadeIn > 0) {
			this.fadeIn -= dt * 1.5;
		}

		// Menu appear animation
		if (this.menuAppearTimer < this.menuAppearDelay) {
			this.menuAppearTimer += dt;
		}

		// Update particles
		this.particles.update(dt);

		// Emit ambient embers
		if (Math.random() < dt * 5) {
			this.particles.emit('ember', Math.random() * CANVAS_WIDTH, CANVAS_HEIGHT + 20, 1, {
				color: { r: 255, g: 150, b: 50 },
			});
		}

		// Emit floating dust
		if (Math.random() < dt * 2) {
			this.particles.emit('dust', Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 1, {
				color: { r: 180, g: 160, b: 140 },
			});
		}

		// Update souls
		this.souls.forEach(soul => {
			soul.y -= soul.speed;
			soul.wavePhase += soul.waveSpeed * dt;
			if (soul.y < -20) {
				soul.y = CANVAS_HEIGHT + 20;
				soul.x = Math.random() * CANVAS_WIDTH;
			}
		});

		// Menu navigation
		if (keys.w || keys.ArrowUp || keys.W) {
			keys.w = keys.ArrowUp = keys.W = false;
			this.selectedIndex = (this.selectedIndex - 1 + this.menuOptions.length) % this.menuOptions.length;
			sounds.play(SoundName.Sword_Swing);
			sounds.stop(SoundName.Sword_Swing);
		}

		if (keys.s || keys.ArrowDown || keys.S) {
			keys.s = keys.ArrowDown = keys.S = false;
			this.selectedIndex = (this.selectedIndex + 1) % this.menuOptions.length;
			sounds.play(SoundName.Sword_Swing);
			sounds.stop(SoundName.Sword_Swing);
		}

		// Selection
		if (keys.Enter) {
			keys.Enter = false;
			sounds.play(SoundName.Confirm);
			sounds.stop(SoundName.Confirm);

			const selected = this.menuOptions[this.selectedIndex];
			if (selected.id === 'play') {
				this.map.player.stateMachine.currentState.stopPraying();
				stateMachine.change(GameStateName.Play, { map: this.map });
			} else if (selected.id === 'credits') {
				stateMachine.change(GameStateName.Credits, { map: this.map });
			}
		}
	}

	render(context) {
		context.save();

		// Render game world behind
		this.map.render();

		// Dark overlay
		context.fillStyle = 'rgba(0, 0, 0, 0.4)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Render floating souls
		this.renderSouls(context);

		// Render particles
		this.particles.render();

		// Render torch flames
		this.renderTorchFlames(context);

		// Render vignette
		this.renderVignette(context);

		// Render title
		this.renderTitle(context);

		// Render menu
		this.renderMenu(context);

		// Render decorative elements
		this.renderDecorations(context);

		// Fade in overlay
		if (this.fadeIn > 0) {
			context.fillStyle = `rgba(0, 0, 0, ${this.fadeIn})`;
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		}

		context.restore();
	}

	renderSouls(context) {
		this.souls.forEach(soul => {
			const x = soul.x + Math.sin(soul.wavePhase) * soul.waveAmplitude;
			const alpha = soul.opacity * (0.5 + Math.sin(soul.wavePhase * 2) * 0.5);

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

	renderTorchFlames(context) {
		this.torchFlames.forEach((torch, index) => {
			torch.phase += 0.1;
			const flicker = 0.8 + Math.sin(torch.phase * 3) * 0.2 + Math.sin(torch.phase * 7) * 0.1;

			// Flame glow
			const gradient = context.createRadialGradient(
				torch.x, torch.y, 0,
				torch.x, torch.y, 80 * flicker
			);
			gradient.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
			gradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.2)');
			gradient.addColorStop(0.6, 'rgba(255, 100, 0, 0.1)');
			gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(torch.x, torch.y, 80 * flicker, 0, Math.PI * 2);
			context.fill();

			// Emit flame particles occasionally
			if (Math.random() < 0.1) {
				this.particles.emit('ember', torch.x, torch.y - 20, 1, {
					color: { r: 255, g: 180, b: 80 },
					spread: 15,
				});
			}
		});
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

	renderTitle(context) {
		const titleY = CANVAS_HEIGHT * 0.25 + this.titleFloat;
		const glowIntensity = 0.6 + Math.sin(this.titleGlowPhase) * 0.2;

		context.textAlign = 'center';
		context.textBaseline = 'middle';

		// Deep shadow layers
		context.font = '96px Dungeon';
		context.globalAlpha = 0.6;
		context.fillStyle = 'rgba(0, 0, 0, 0.9)';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2 + 6, titleY + 6);
		context.fillText('Lost Souls', CANVAS_WIDTH / 2 + 4, titleY + 4);

		// Outer fire glow
		context.globalAlpha = glowIntensity * 0.7;
		context.shadowBlur = 40;
		context.shadowColor = 'rgba(200, 80, 30, 1)';
		context.fillStyle = 'rgba(200, 80, 30, 0.5)';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, titleY);

		// Inner glow
		context.shadowBlur = 25;
		context.shadowColor = 'rgba(255, 150, 80, 1)';
		context.fillStyle = 'rgba(255, 150, 80, 0.7)';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, titleY);

		// Main title
		context.globalAlpha = 1;
		context.shadowBlur = 15;
		context.shadowColor = 'rgba(255, 200, 120, 0.9)';
		context.fillStyle = '#fff5e6';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, titleY);

		// Highlight edge
		context.shadowBlur = 5;
		context.shadowColor = 'rgba(255, 220, 180, 1)';
		context.fillStyle = '#fffaf0';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, titleY - 1);

		context.shadowBlur = 0;

		// Subtitle
		const subtitleOpacity = 0.5 + Math.sin(this.animationTimer * 2) * 0.2;
		context.globalAlpha = subtitleOpacity;
		context.font = '24px Dungeon';
		context.fillStyle = '#c4a070';
		context.shadowBlur = 10;
		context.shadowColor = 'rgba(200, 160, 100, 0.5)';
		context.fillText('A Dark Fantasy Adventure', CANVAS_WIDTH / 2, titleY + 60);
		context.shadowBlur = 0;
		context.globalAlpha = 1;
	}

	renderMenu(context) {
		const menuStartY = CANVAS_HEIGHT * 0.55;
		const menuSpacing = 55;
		const menuAppear = Math.min(1, this.menuAppearTimer / this.menuAppearDelay);

		if (menuAppear <= 0) return;

		context.textAlign = 'center';
		context.textBaseline = 'middle';

		this.menuOptions.forEach((option, index) => {
			const delay = index * 0.15;
			const itemAppear = Math.max(0, Math.min(1, (menuAppear - delay) * 2));
			if (itemAppear <= 0) return;

			const y = menuStartY + index * menuSpacing;
			const isSelected = index === this.selectedIndex;

			// Slide in from left/right alternating
			const slideOffset = (1 - itemAppear) * (index % 2 === 0 ? -50 : 50);

			context.globalAlpha = itemAppear;
			context.save();
			context.translate(slideOffset, 0);

			if (isSelected) {
				// Selection glow background
				const glowWidth = 300;
				const glowHeight = 45;
				const glowX = (CANVAS_WIDTH - glowWidth) / 2;
				const glowY = y - glowHeight / 2;

				const selGlow = context.createRadialGradient(
					CANVAS_WIDTH / 2, y, 0,
					CANVAS_WIDTH / 2, y, glowWidth / 2
				);
				selGlow.addColorStop(0, 'rgba(255, 180, 80, 0.3)');
				selGlow.addColorStop(0.5, 'rgba(200, 120, 50, 0.15)');
				selGlow.addColorStop(1, 'rgba(150, 80, 30, 0)');
				context.fillStyle = selGlow;
				context.fillRect(glowX, glowY, glowWidth, glowHeight);

				// Animated selection indicators
				const pulse = Math.sin(this.animationTimer * 4) * 5;
				context.font = '36px Dungeon';
				context.shadowBlur = 12;
				context.shadowColor = 'rgba(255, 180, 100, 0.9)';
				context.fillStyle = '#ffd700';
				context.fillText('>', CANVAS_WIDTH / 2 - 140 - pulse, y);
				context.fillText('<', CANVAS_WIDTH / 2 + 140 + pulse, y);

				// Main text with glow
				context.font = '40px Dungeon';
				context.shadowBlur = 15;
				context.shadowColor = 'rgba(255, 200, 100, 1)';
				context.fillStyle = '#fff5dc';
				context.fillText(option.label, CANVAS_WIDTH / 2, y);

				// Description below
				context.font = '18px Dungeon';
				context.shadowBlur = 5;
				context.shadowColor = 'rgba(0, 0, 0, 0.8)';
				context.fillStyle = 'rgba(200, 180, 150, 0.8)';
				context.fillText(option.description, CANVAS_WIDTH / 2, y + 26);
			} else {
				// Non-selected option
				context.font = '36px Dungeon';
				context.shadowBlur = 4;
				context.shadowColor = 'rgba(0, 0, 0, 0.6)';
				context.fillStyle = '#888888';
				context.fillText(option.label, CANVAS_WIDTH / 2, y);
			}

			context.restore();
		});

		context.globalAlpha = 1;
		context.shadowBlur = 0;
	}

	renderDecorations(context) {
		// Decorative divider lines
		const dividerY = CANVAS_HEIGHT * 0.42;
		const dividerWidth = 250;

		context.strokeStyle = 'rgba(139, 90, 43, 0.5)';
		context.lineWidth = 1;

		// Left divider
		context.beginPath();
		context.moveTo(CANVAS_WIDTH / 2 - dividerWidth, dividerY);
		context.lineTo(CANVAS_WIDTH / 2 - 30, dividerY);
		context.stroke();

		// Right divider
		context.beginPath();
		context.moveTo(CANVAS_WIDTH / 2 + 30, dividerY);
		context.lineTo(CANVAS_WIDTH / 2 + dividerWidth, dividerY);
		context.stroke();

		// Center ornament
		context.fillStyle = 'rgba(200, 150, 80, 0.6)';
		context.beginPath();
		context.arc(CANVAS_WIDTH / 2, dividerY, 4, 0, Math.PI * 2);
		context.fill();

		// Version/hint at bottom
		context.font = '16px Dungeon';
		context.textAlign = 'center';
		context.fillStyle = 'rgba(100, 100, 100, 0.6)';
		context.fillText('Use W/S or Arrow Keys to Navigate | Enter to Select', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 25);
	}
}
