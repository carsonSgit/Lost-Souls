import { CANVAS_WIDTH, CANVAS_HEIGHT, context } from "../globals.js";

/**
 * HUD (Heads-Up Display) class for rendering game UI elements
 * Displays health bar, score, and other game statistics
 */
export default class HUD {
	constructor(player) {
		this.player = player;

		// HUD positioning
		this.heartSize = 16;
		this.heartSpacing = 4;
		this.padding = 12;

		// Animation for hearts
		this.heartBeatTimer = 0;
		this.heartBeatSpeed = 2;
	}

	update(dt) {
		// Animate heart beat when low health
		if (this.player.currentHealth <= 4) {
			this.heartBeatTimer += dt * this.heartBeatSpeed;
		}
	}

	render() {
		context.save();

		this.renderHealthBar();
		this.renderScore();
		this.renderHighScore();

		context.restore();
	}

	/**
	 * Renders health bar in the top-left corner
	 * Dark Souls inspired health bar with glow effects
	 */
	renderHealthBar() {
		const healthPercent = this.player.currentHealth / this.player.maxHealth;

		// Health bar dimensions
		const barWidth = 180;
		const barHeight = 20;
		const barX = this.padding * 1.5;
		const barY = this.padding * 1.5;

		// Panel background
		const panelWidth = barWidth + this.padding * 2;
		const panelHeight = barHeight + this.padding * 2;

		// Draw semi-transparent dark background panel
		context.fillStyle = 'rgba(20, 15, 10, 0.75)';
		this.roundRect(
			this.padding,
			this.padding,
			panelWidth,
			panelHeight,
			6
		);
		context.fill();

		// Border with glow
		context.strokeStyle = 'rgba(139, 69, 19, 0.8)';
		context.lineWidth = 2;
		context.shadowBlur = 8;
		context.shadowColor = 'rgba(255, 140, 80, 0.6)';
		this.roundRect(
			this.padding,
			this.padding,
			panelWidth,
			panelHeight,
			6
		);
		context.stroke();
		context.shadowBlur = 0;

		// Health bar background (dark red)
		context.fillStyle = 'rgba(60, 20, 20, 0.9)';
		this.roundRect(barX, barY, barWidth, barHeight, 4);
		context.fill();

		// Health bar border
		context.strokeStyle = 'rgba(40, 15, 15, 0.9)';
		context.lineWidth = 1;
		this.roundRect(barX, barY, barWidth, barHeight, 4);
		context.stroke();

		// Calculate current health bar width
		const currentBarWidth = barWidth * healthPercent;

		if (currentBarWidth > 0) {
			// Health bar fill with gradient
			const healthGradient = context.createLinearGradient(
				barX, barY,
				barX + currentBarWidth, barY
			);

			// Color based on health percentage
			if (healthPercent > 0.5) {
				// Green to yellow (healthy)
				healthGradient.addColorStop(0, '#8B0000'); // Dark red
				healthGradient.addColorStop(1, '#DC143C'); // Crimson
			} else if (healthPercent > 0.25) {
				// Yellow to orange (warning)
				healthGradient.addColorStop(0, '#8B0000');
				healthGradient.addColorStop(1, '#B22222'); // Fire brick
			} else {
				// Orange to red (critical)
				healthGradient.addColorStop(0, '#660000');
				healthGradient.addColorStop(1, '#8B0000');
			}

			// Add pulsing glow when low health
			if (healthPercent <= 0.4) {
				const pulseIntensity = 0.5 + Math.sin(this.heartBeatTimer * 2) * 0.5;
				context.shadowBlur = 12 * pulseIntensity;
				context.shadowColor = `rgba(220, 20, 60, ${pulseIntensity})`;
			} else {
				context.shadowBlur = 6;
				context.shadowColor = 'rgba(220, 20, 60, 0.6)';
			}

			context.fillStyle = healthGradient;
			this.roundRect(barX, barY, currentBarWidth, barHeight, 4);
			context.fill();

			// Highlight shine on top
			const shineGradient = context.createLinearGradient(
				barX, barY,
				barX, barY + barHeight / 2
			);
			shineGradient.addColorStop(0, 'rgba(255, 100, 100, 0.3)');
			shineGradient.addColorStop(1, 'rgba(255, 100, 100, 0)');

			context.shadowBlur = 0;
			context.fillStyle = shineGradient;
			this.roundRect(barX, barY, currentBarWidth, barHeight / 2, 4);
			context.fill();
		}

		// Health text overlay
		context.shadowBlur = 3;
		context.shadowColor = 'rgba(0, 0, 0, 0.8)';
		context.font = '14px Dungeon';
		context.fillStyle = '#ffffff';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(
			`${this.player.currentHealth} / ${this.player.maxHealth}`,
			barX + barWidth / 2,
			barY + barHeight / 2
		);

		context.shadowBlur = 0;
	}

	/**
	 * Renders the current score in the top-right corner
	 */
	renderScore() {
		const scoreText = `Score: ${this.player.score}`;

		// Measure text for panel sizing
		context.font = '20px Dungeon';
		const textWidth = context.measureText(scoreText).width;
		const panelWidth = textWidth + this.padding * 3;
		const panelHeight = 28;
		const panelX = CANVAS_WIDTH - panelWidth - this.padding;

		// Draw semi-transparent dark background panel
		context.fillStyle = 'rgba(20, 15, 10, 0.7)';
		this.roundRect(
			panelX,
			this.padding,
			panelWidth,
			panelHeight,
			6
		);
		context.fill();

		// Border with glow
		context.strokeStyle = 'rgba(139, 69, 19, 0.8)';
		context.lineWidth = 2;
		context.shadowBlur = 8;
		context.shadowColor = 'rgba(255, 215, 100, 0.6)';
		this.roundRect(
			panelX,
			this.padding,
			panelWidth,
			panelHeight,
			6
		);
		context.stroke();
		context.shadowBlur = 0;

		// Draw score text
		context.font = '20px Dungeon';
		context.fillStyle = '#ffd966';
		context.shadowBlur = 4;
		context.shadowColor = 'rgba(255, 215, 100, 0.8)';
		context.textAlign = 'left';
		context.textBaseline = 'middle';
		context.fillText(
			scoreText,
			panelX + this.padding * 1.5,
			this.padding + panelHeight / 2
		);

		context.shadowBlur = 0;
	}

	/**
	 * Renders the high score below the current score
	 */
	renderHighScore() {
		const scoreText = `Best: ${this.player.highScore}`;

		// Measure text for panel sizing
		context.font = '16px Dungeon';
		const textWidth = context.measureText(scoreText).width;
		const panelWidth = textWidth + this.padding * 3;
		const panelHeight = 24;
		const panelX = CANVAS_WIDTH - panelWidth - this.padding;
		const panelY = this.padding * 2 + 28 + 4; // Below score panel

		// Draw semi-transparent dark background panel
		context.fillStyle = 'rgba(20, 15, 10, 0.7)';
		this.roundRect(
			panelX,
			panelY,
			panelWidth,
			panelHeight,
			6
		);
		context.fill();

		// Border
		context.strokeStyle = 'rgba(139, 69, 19, 0.6)';
		context.lineWidth = 2;
		context.shadowBlur = 6;
		context.shadowColor = 'rgba(180, 140, 80, 0.4)';
		this.roundRect(
			panelX,
			panelY,
			panelWidth,
			panelHeight,
			6
		);
		context.stroke();
		context.shadowBlur = 0;

		// Draw high score text
		context.font = '16px Dungeon';
		context.fillStyle = '#d4af77';
		context.shadowBlur = 3;
		context.shadowColor = 'rgba(212, 175, 119, 0.6)';
		context.textAlign = 'left';
		context.textBaseline = 'middle';
		context.fillText(
			scoreText,
			panelX + this.padding * 1.5,
			panelY + panelHeight / 2
		);

		context.shadowBlur = 0;
	}

	/**
	 * Helper function to draw rounded rectangles
	 */
	roundRect(x, y, width, height, radius) {
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
