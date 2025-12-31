import { context } from "../globals.js";

/**
 * Floating Damage Numbers System
 * Shows damage dealt, healing, and status effects as floating text
 */
export default class DamageNumbers {
	constructor() {
		this.numbers = [];
	}

	/**
	 * Show a damage number
	 * @param {number} x - World X position
	 * @param {number} y - World Y position
	 * @param {number|string} value - The number/text to show
	 * @param {string} type - Type: 'damage', 'critical', 'heal', 'miss', 'block', 'poison', 'xp'
	 */
	add(x, y, value, type = 'damage') {
		const config = this.getConfig(type);

		this.numbers.push({
			x: x + (Math.random() - 0.5) * 20,
			y: y - 10,
			value: String(value),
			type,
			vx: (Math.random() - 0.5) * 1.5,
			vy: -3 - Math.random() * 2,
			gravity: 0.15,
			life: 1,
			maxLife: config.duration,
			decay: 1 / config.duration,
			scale: config.startScale,
			targetScale: config.endScale,
			color: config.color,
			outlineColor: config.outline,
			font: config.font,
			glow: config.glow,
			glowColor: config.glowColor,
			shake: type === 'critical',
			rise: type === 'heal' || type === 'xp',
		});
	}

	/**
	 * Show a combo counter
	 */
	addCombo(x, y, comboCount) {
		this.numbers.push({
			x,
			y: y - 30,
			value: `${comboCount} HIT${comboCount > 1 ? 'S' : ''}!`,
			type: 'combo',
			vx: 0,
			vy: -1,
			gravity: 0,
			life: 1,
			maxLife: 0.8,
			decay: 1.25,
			scale: 0.5,
			targetScale: 1.2,
			color: '#ffdd44',
			outlineColor: '#442200',
			font: 'Dungeon',
			glow: true,
			glowColor: 'rgba(255, 200, 50, 0.8)',
			shake: true,
			rise: false,
		});
	}

	getConfig(type) {
		const configs = {
			damage: {
				color: '#ff4444',
				outline: '#440000',
				font: 'Dungeon',
				duration: 1,
				startScale: 1.2,
				endScale: 0.8,
				glow: false,
				glowColor: null,
			},
			critical: {
				color: '#ff8800',
				outline: '#441100',
				font: 'Dungeon',
				duration: 1.2,
				startScale: 1.5,
				endScale: 1,
				glow: true,
				glowColor: 'rgba(255, 150, 50, 0.8)',
			},
			heal: {
				color: '#44ff66',
				outline: '#004411',
				font: 'Dungeon',
				duration: 1.2,
				startScale: 1,
				endScale: 1.1,
				glow: true,
				glowColor: 'rgba(100, 255, 150, 0.6)',
			},
			miss: {
				color: '#888888',
				outline: '#222222',
				font: 'Dungeon',
				duration: 0.8,
				startScale: 0.8,
				endScale: 0.6,
				glow: false,
				glowColor: null,
			},
			block: {
				color: '#8888ff',
				outline: '#000044',
				font: 'Dungeon',
				duration: 0.8,
				startScale: 1,
				endScale: 0.8,
				glow: true,
				glowColor: 'rgba(100, 100, 255, 0.5)',
			},
			poison: {
				color: '#88ff44',
				outline: '#224400',
				font: 'Dungeon',
				duration: 1,
				startScale: 0.9,
				endScale: 0.7,
				glow: true,
				glowColor: 'rgba(150, 255, 100, 0.5)',
			},
			xp: {
				color: '#ffdd00',
				outline: '#443300',
				font: 'Dungeon',
				duration: 1.5,
				startScale: 0.8,
				endScale: 1,
				glow: true,
				glowColor: 'rgba(255, 220, 100, 0.6)',
			},
		};

		return configs[type] || configs.damage;
	}

	update(dt) {
		for (let i = this.numbers.length - 1; i >= 0; i--) {
			const num = this.numbers[i];

			// Decay life
			num.life -= num.decay * dt;

			if (num.life <= 0) {
				this.numbers.splice(i, 1);
				continue;
			}

			// Apply physics
			if (num.rise) {
				// Healing numbers float up smoothly
				num.vy = -1.5;
			} else {
				num.vy += num.gravity;
			}

			num.x += num.vx;
			num.y += num.vy;

			// Friction on horizontal movement
			num.vx *= 0.98;

			// Interpolate scale
			const lifeProgress = 1 - (num.life / num.maxLife);
			num.scale = num.scale + (num.targetScale - num.scale) * 0.1;
		}
	}

	/**
	 * Render damage numbers (call with camera offset for world-space numbers)
	 */
	render(cameraOffsetX = 0, cameraOffsetY = 0) {
		context.save();

		this.numbers.forEach(num => {
			const alpha = Math.min(1, num.life * 2);
			const screenX = num.x - cameraOffsetX;
			const screenY = num.y - cameraOffsetY;

			// Shake effect for critical hits
			let shakeX = 0, shakeY = 0;
			if (num.shake && num.life > 0.5) {
				shakeX = (Math.random() - 0.5) * 4;
				shakeY = (Math.random() - 0.5) * 4;
			}

			const fontSize = Math.floor(24 * num.scale);
			context.font = `${fontSize}px ${num.font}`;
			context.textAlign = 'center';
			context.textBaseline = 'middle';

			// Glow effect
			if (num.glow && num.glowColor) {
				context.globalAlpha = alpha * 0.8;
				context.shadowBlur = 15;
				context.shadowColor = num.glowColor;
				context.fillStyle = num.glowColor;
				context.fillText(num.value, screenX + shakeX, screenY + shakeY);
			}

			// Outline
			context.globalAlpha = alpha;
			context.shadowBlur = 0;
			context.strokeStyle = num.outlineColor;
			context.lineWidth = 3;
			context.strokeText(num.value, screenX + shakeX, screenY + shakeY);

			// Main text
			context.fillStyle = num.color;
			context.shadowBlur = 4;
			context.shadowColor = num.outlineColor;
			context.fillText(num.value, screenX + shakeX, screenY + shakeY);
		});

		context.restore();
	}

	/**
	 * Render damage numbers in screen space (no camera offset)
	 */
	renderScreen() {
		this.render(0, 0);
	}

	/**
	 * Clear all numbers
	 */
	clear() {
		this.numbers = [];
	}
}
