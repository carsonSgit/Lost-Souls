import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import SoundName from "../enums/SoundName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, keys, sounds, stateMachine, context } from "../globals.js";
import ParticleSystem from "../objects/ParticleSystem.js";

export default class PauseState extends State {
	constructor() {
		super();

		// Menu system
		this.menuOptions = [
			{ id: 'resume', label: 'Resume', icon: '>' },
			{ id: 'save', label: 'Save Score', icon: '*' },
			{ id: 'quit', label: 'Quit to Title', icon: 'x' },
		];
		this.selectedIndex = 0;

		// Particle system
		this.particles = new ParticleSystem();

		// Animation
		this.animationTimer = 0;
		this.overlayAlpha = 0;
		this.menuSlideIn = 0;

		// Frozen frame effect
		this.freezeFrame = null;
	}

	enter(parameters) {
		this.map = parameters.map;
		this.selectedIndex = 0;
		this.animationTimer = 0;
		this.overlayAlpha = 0;
		this.menuSlideIn = 0;

		// Clear and start particles
		this.particles.clear();
	}

	update(dt) {
		this.animationTimer += dt;

		// Animate overlay fade in
		if (this.overlayAlpha < 0.7) {
			this.overlayAlpha += dt * 3;
		}

		// Animate menu slide in
		if (this.menuSlideIn < 1) {
			this.menuSlideIn += dt * 4;
		}

		// Update particles
		this.particles.update(dt);

		// Emit ambient particles
		if (Math.random() < dt * 3) {
			this.particles.emit('dust', Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 1, {
				color: { r: 100, g: 150, b: 200 },
			});
		}

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

		// Quick resume with P
		if (keys.p || keys.P) {
			sounds.play(SoundName.Unpause);
			sounds.stop(SoundName.Unpause);
			keys.p = keys.P = false;
			stateMachine.change(GameStateName.Play, { map: this.map, fromPause: true });
		}

		// Selection with Enter
		if (keys.Enter) {
			keys.Enter = false;
			this.handleSelection();
		}
	}

	handleSelection() {
		const selected = this.menuOptions[this.selectedIndex];

		switch (selected.id) {
			case 'resume':
				sounds.play(SoundName.Unpause);
				sounds.stop(SoundName.Unpause);
				stateMachine.change(GameStateName.Play, { map: this.map, fromPause: true });
				break;

			case 'save':
				localStorage.setItem('playerScore', this.map.player.score);
				sounds.play(SoundName.Confirm);
				sounds.stop(SoundName.Confirm);
				// Visual feedback - could add notification
				break;

			case 'quit':
				sounds.play(SoundName.Confirm);
				sounds.stop(SoundName.Confirm);
				stateMachine.change(GameStateName.TitleScreen);
				break;
		}
	}

	render(context) {
		context.save();

		// Render frozen game state
		this.map.render();

		// Dark overlay with blur effect simulation
		this.renderOverlay(context);

		// Render particles
		this.particles.render();

		// Render pause panel
		this.renderPausePanel(context);

		// Render stats
		this.renderStats(context);

		context.restore();
	}

	renderOverlay(context) {
		// Main dark overlay
		context.fillStyle = `rgba(0, 0, 10, ${this.overlayAlpha * 0.6})`;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Blue-tinted vignette for "frozen" effect
		const gradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.2,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.9
		);
		gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		gradient.addColorStop(0.5, `rgba(10, 20, 40, ${this.overlayAlpha * 0.4})`);
		gradient.addColorStop(1, `rgba(0, 10, 30, ${this.overlayAlpha * 0.8})`);

		context.fillStyle = gradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Scanline effect (subtle)
		context.globalAlpha = 0.03;
		for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
			context.fillStyle = '#000';
			context.fillRect(0, y, CANVAS_WIDTH, 2);
		}
		context.globalAlpha = 1;
	}

	renderPausePanel(context) {
		const panelWidth = 320;
		const panelHeight = 280;
		const panelX = (CANVAS_WIDTH - panelWidth) / 2;
		const panelY = (CANVAS_HEIGHT - panelHeight) / 2 - 20;

		// Slide-in effect
		const slideOffset = (1 - Math.min(1, this.menuSlideIn)) * -50;
		const alpha = Math.min(1, this.menuSlideIn);

		context.globalAlpha = alpha;
		context.save();
		context.translate(0, slideOffset);

		// Panel background with gradient
		const panelGrad = context.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
		panelGrad.addColorStop(0, 'rgba(20, 25, 35, 0.95)');
		panelGrad.addColorStop(0.5, 'rgba(15, 18, 28, 0.95)');
		panelGrad.addColorStop(1, 'rgba(10, 12, 20, 0.95)');

		context.fillStyle = panelGrad;
		this.roundRect(context, panelX, panelY, panelWidth, panelHeight, 12);
		context.fill();

		// Panel border with glow
		context.strokeStyle = 'rgba(80, 120, 180, 0.6)';
		context.lineWidth = 2;
		context.shadowBlur = 15;
		context.shadowColor = 'rgba(100, 150, 220, 0.5)';
		this.roundRect(context, panelX, panelY, panelWidth, panelHeight, 12);
		context.stroke();

		// Inner border
		context.strokeStyle = 'rgba(60, 80, 120, 0.4)';
		context.lineWidth = 1;
		context.shadowBlur = 0;
		this.roundRect(context, panelX + 4, panelY + 4, panelWidth - 8, panelHeight - 8, 10);
		context.stroke();

		// Title
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		// Title glow
		const pulse = Math.sin(this.animationTimer * 2) * 0.2 + 0.8;
		context.font = '42px Dungeon';
		context.shadowBlur = 20;
		context.shadowColor = `rgba(100, 150, 255, ${pulse})`;
		context.fillStyle = '#b8d4ff';
		context.fillText('PAUSED', CANVAS_WIDTH / 2, panelY + 45);

		// Decorative line under title
		context.shadowBlur = 0;
		const lineWidth = 180;
		const lineY = panelY + 75;
		const lineGrad = context.createLinearGradient(
			CANVAS_WIDTH / 2 - lineWidth / 2, lineY,
			CANVAS_WIDTH / 2 + lineWidth / 2, lineY
		);
		lineGrad.addColorStop(0, 'rgba(80, 120, 180, 0)');
		lineGrad.addColorStop(0.5, 'rgba(80, 120, 180, 0.8)');
		lineGrad.addColorStop(1, 'rgba(80, 120, 180, 0)');
		context.strokeStyle = lineGrad;
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(CANVAS_WIDTH / 2 - lineWidth / 2, lineY);
		context.lineTo(CANVAS_WIDTH / 2 + lineWidth / 2, lineY);
		context.stroke();

		// Menu options
		const menuStartY = panelY + 110;
		const menuSpacing = 50;

		this.menuOptions.forEach((option, index) => {
			const y = menuStartY + index * menuSpacing;
			const isSelected = index === this.selectedIndex;

			if (isSelected) {
				// Selection highlight bar
				const highlightGrad = context.createLinearGradient(
					panelX + 20, y - 15,
					panelX + panelWidth - 20, y - 15
				);
				highlightGrad.addColorStop(0, 'rgba(80, 150, 255, 0)');
				highlightGrad.addColorStop(0.5, 'rgba(80, 150, 255, 0.2)');
				highlightGrad.addColorStop(1, 'rgba(80, 150, 255, 0)');
				context.fillStyle = highlightGrad;
				context.fillRect(panelX + 20, y - 18, panelWidth - 40, 36);

				// Selection indicator
				const indicatorPulse = Math.sin(this.animationTimer * 5) * 3;
				context.font = '24px Dungeon';
				context.shadowBlur = 10;
				context.shadowColor = 'rgba(150, 200, 255, 0.8)';
				context.fillStyle = '#88ccff';
				context.fillText('>', CANVAS_WIDTH / 2 - 90 - indicatorPulse, y);
				context.fillText('<', CANVAS_WIDTH / 2 + 90 + indicatorPulse, y);

				// Selected text
				context.font = '28px Dungeon';
				context.shadowBlur = 12;
				context.shadowColor = 'rgba(150, 200, 255, 0.9)';
				context.fillStyle = '#ffffff';
				context.fillText(option.label, CANVAS_WIDTH / 2, y);
			} else {
				// Unselected text
				context.font = '24px Dungeon';
				context.shadowBlur = 3;
				context.shadowColor = 'rgba(0, 0, 0, 0.5)';
				context.fillStyle = '#667788';
				context.fillText(option.label, CANVAS_WIDTH / 2, y);
			}
		});

		context.shadowBlur = 0;
		context.restore();
		context.globalAlpha = 1;
	}

	renderStats(context) {
		// Stats at bottom corners
		const alpha = Math.min(1, this.menuSlideIn);
		context.globalAlpha = alpha;

		context.font = '24px Dungeon';
		context.textBaseline = 'bottom';

		// Current score (right side)
		context.textAlign = 'right';
		context.shadowBlur = 6;
		context.shadowColor = 'rgba(255, 200, 100, 0.5)';
		context.fillStyle = '#ffd966';
		context.fillText(`Souls: ${this.map.player.score}`, CANVAS_WIDTH - 30, CANVAS_HEIGHT - 25);

		// High score (left side)
		context.textAlign = 'left';
		context.shadowColor = 'rgba(200, 150, 100, 0.5)';
		context.fillStyle = '#c4a060';
		context.fillText(`Best: ${this.map.player.highScore}`, 30, CANVAS_HEIGHT - 25);

		// Hint
		context.font = '12px Dungeon';
		context.textAlign = 'center';
		context.shadowBlur = 0;
		context.fillStyle = 'rgba(100, 120, 150, 0.6)';
		context.fillText('Press P to Quick Resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);

		context.globalAlpha = 1;
	}

	// Helper: Rounded rectangle
	roundRect(context, x, y, width, height, radius) {
		context.beginPath();
		context.moveTo(x + radius, y);
		context.lineTo(x + width - radius, y);
		context.quadraticCurveTo(x + width, y, x + width, y + radius);
		context.lineTo(x + width, y + height - radius);
		context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		context.lineTo(x + radius, y + height);
		context.quadraticCurveTo(x, y + height, x, y + height - radius);
		context.lineTo(x, y + radius);
		context.quadraticCurveTo(x, y, x + radius, y);
		context.closePath();
	}
}
