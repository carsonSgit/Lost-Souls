import { CANVAS_WIDTH, CANVAS_HEIGHT, context } from "../globals.js";

/**
 * Enhanced HUD (Heads-Up Display) for dark fantasy game
 * Features: Ornate health bar, score display, boss health bar, status effects
 */
export default class HUD {
	constructor(player) {
		this.player = player;
		this.map = null; // Will be set when map is available

		// HUD positioning
		this.padding = 16;
		this.animationTimer = 0;

		// Health bar animation
		this.displayedHealth = player.currentHealth;
		this.healthLerpSpeed = 5;
		this.healthFlashTimer = 0;
		this.lastHealth = player.currentHealth;

		// Score animation
		this.displayedScore = player.score;
		this.scoreLerpSpeed = 10;

		// Boss health bar
		this.bossEnemy = null;
		this.bossHealthDisplay = 0;
		this.bossBarVisible = false;
		this.bossBarAlpha = 0;
		this.lastBossHealth = 0;
		this.bossHealthFlashTimer = 0;
		this.bossHealthLerpSpeed = 5;

		// Low health warning
		this.lowHealthPulse = 0;
		this.criticalHealthWarning = false;

		// Notification queue
		this.notifications = [];

		// Combo counter
		this.displayedCombo = 0;
		this.comboScale = 1;
		this.comboFlash = 0;
		this.lastCombo = 0;
		this.comboColorPhase = 0;

		// Kill tracker
		this.displayedKills = 0;
		this.killFlash = 0;
	}

	/**
	 * Set the boss enemy for boss health bar display
	 */
	setBoss(enemy) {
		this.bossEnemy = enemy;
		if (enemy) {
			this.bossHealthDisplay = enemy.currentHealth;
			this.lastBossHealth = enemy.currentHealth;
		} else {
			this.bossHealthDisplay = 0;
			this.lastBossHealth = 0;
		}
		this.bossBarVisible = !!enemy;
	}

	/**
	 * Add a notification message
	 */
	addNotification(message, type = 'info') {
		this.notifications.push({
			message,
			type,
			life: 1,
			maxLife: 3,
			decay: 0.33,
			y: 0,
		});
	}

	update(dt) {
		this.animationTimer += dt;

		// Lerp health display
		const healthDiff = this.player.currentHealth - this.displayedHealth;
		this.displayedHealth += healthDiff * this.healthLerpSpeed * dt;

		// Flash when taking damage
		if (this.player.currentHealth < this.lastHealth) {
			this.healthFlashTimer = 0.3;
		}
		this.lastHealth = this.player.currentHealth;
		this.healthFlashTimer = Math.max(0, this.healthFlashTimer - dt);

		// Low health warning
		const healthPercent = this.player.currentHealth / this.player.maxHealth;
		if (healthPercent <= 0.25) {
			this.criticalHealthWarning = true;
			this.lowHealthPulse += dt * 4;
		} else if (healthPercent <= 0.4) {
			this.criticalHealthWarning = false;
			this.lowHealthPulse += dt * 2;
		} else {
			this.criticalHealthWarning = false;
			this.lowHealthPulse = 0;
		}

		// Lerp score display
		const scoreDiff = this.player.score - this.displayedScore;
		this.displayedScore += Math.ceil(scoreDiff * this.scoreLerpSpeed * dt);
		if (Math.abs(this.displayedScore - this.player.score) < 1) {
			this.displayedScore = this.player.score;
		}

		// Boss health bar
		if (this.bossBarVisible && this.bossEnemy) {
			const bossDiff = this.bossEnemy.currentHealth - this.bossHealthDisplay;
			this.bossHealthDisplay += bossDiff * this.bossHealthLerpSpeed * dt;
			
			// Flash when taking damage
			if (this.bossEnemy.currentHealth < this.lastBossHealth) {
				this.bossHealthFlashTimer = 0.3;
			}
			this.lastBossHealth = this.bossEnemy.currentHealth;
			this.bossHealthFlashTimer = Math.max(0, this.bossHealthFlashTimer - dt);
			
			this.bossBarAlpha = Math.min(1, this.bossBarAlpha + dt * 2);
		} else {
			this.bossBarAlpha = Math.max(0, this.bossBarAlpha - dt * 2);
		}

		// Update notifications
		for (let i = this.notifications.length - 1; i >= 0; i--) {
			const notif = this.notifications[i];
			notif.life -= notif.decay * dt;
			notif.y -= dt * 30;
			if (notif.life <= 0) {
				this.notifications.splice(i, 1);
			}
		}

		// Update combo counter
		if (this.map) {
			const currentCombo = this.map.comboCount || 0;
			const currentKills = this.map.killCount || 0;

			// Combo changed - trigger effects
			if (currentCombo > this.lastCombo && currentCombo > 1) {
				this.comboFlash = 1;
				this.comboScale = 1.5;
			}
			this.lastCombo = currentCombo;

			// Animate combo display
			if (this.displayedCombo !== currentCombo) {
				this.displayedCombo = currentCombo;
			}
			this.comboScale = Math.max(1, this.comboScale - dt * 3);
			this.comboFlash = Math.max(0, this.comboFlash - dt * 3);
			this.comboColorPhase += dt * 5;

			// Kill tracker
			if (currentKills > this.displayedKills) {
				this.killFlash = 1;
			}
			this.displayedKills = currentKills;
			this.killFlash = Math.max(0, this.killFlash - dt * 2);
		}
	}

	render() {
		context.save();

		// Render health bar
		this.renderHealthBar();

		// Render score
		this.renderScore();

		// Render high score
		this.renderHighScore();

		// Render combo counter
		if (this.displayedCombo > 1) {
			this.renderComboCounter();
		}

		// Render kill tracker
		this.renderKillTracker();

		// Render boss health bar if visible
		if (this.bossBarAlpha > 0) {
			this.renderBossHealthBar();
		}

		// Render notifications
		this.renderNotifications();

		// Render low health warning
		if (this.criticalHealthWarning) {
			this.renderLowHealthWarning();
		}

		context.restore();
	}

	/**
	 * Renders ornate health bar in the top-left corner
	 */
	renderHealthBar() {
		const healthPercent = this.displayedHealth / this.player.maxHealth;

		// Health bar dimensions
		const barWidth = 200;
		const barHeight = 24;
		const barX = this.padding + 10;
		const barY = this.padding + 8;

		// Ornate frame dimensions
		const frameWidth = barWidth + 20;
		const frameHeight = barHeight + 16;
		const frameX = this.padding;
		const frameY = this.padding;

		// Draw ornate frame background
		context.fillStyle = 'rgba(15, 10, 8, 0.85)';
		this.drawOrnateFrame(frameX, frameY, frameWidth, frameHeight);

		// Health bar background (dark cavity)
		context.fillStyle = 'rgba(40, 15, 15, 0.95)';
		this.roundRect(barX, barY, barWidth, barHeight, 3);
		context.fill();

		// Inner shadow
		const innerShadow = context.createLinearGradient(barX, barY, barX, barY + 6);
		innerShadow.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
		innerShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
		context.fillStyle = innerShadow;
		this.roundRect(barX, barY, barWidth, 6, 3);
		context.fill();

		// Calculate current health bar width
		const currentBarWidth = barWidth * healthPercent;

		if (currentBarWidth > 0) {
			// Health bar fill with rich gradient
			const healthGradient = context.createLinearGradient(barX, barY, barX, barY + barHeight);

			// Color based on health percentage
			if (healthPercent > 0.6) {
				healthGradient.addColorStop(0, '#dc3545');
				healthGradient.addColorStop(0.3, '#c82333');
				healthGradient.addColorStop(0.7, '#a71d2a');
				healthGradient.addColorStop(1, '#8b1a23');
			} else if (healthPercent > 0.3) {
				healthGradient.addColorStop(0, '#cc2233');
				healthGradient.addColorStop(0.3, '#aa1a28');
				healthGradient.addColorStop(0.7, '#881520');
				healthGradient.addColorStop(1, '#661018');
			} else {
				// Critical - pulsing effect
				const pulse = 0.7 + Math.sin(this.lowHealthPulse) * 0.3;
				healthGradient.addColorStop(0, `rgba(180, 30, 30, ${pulse})`);
				healthGradient.addColorStop(0.5, `rgba(140, 20, 20, ${pulse})`);
				healthGradient.addColorStop(1, `rgba(100, 15, 15, ${pulse})`);
			}

			// Pulsing glow for low health
			if (healthPercent <= 0.4) {
				const pulseIntensity = 0.5 + Math.sin(this.lowHealthPulse) * 0.5;
				context.shadowBlur = 15 * pulseIntensity;
				context.shadowColor = `rgba(255, 50, 50, ${pulseIntensity})`;
			} else {
				context.shadowBlur = 8;
				context.shadowColor = 'rgba(200, 50, 50, 0.5)';
			}

			context.fillStyle = healthGradient;
			this.roundRect(barX, barY, currentBarWidth, barHeight, 3);
			context.fill();

			// Damage flash overlay
			if (this.healthFlashTimer > 0) {
				context.globalAlpha = this.healthFlashTimer * 2;
				context.fillStyle = 'rgba(255, 255, 255, 0.6)';
				this.roundRect(barX, barY, currentBarWidth, barHeight, 3);
				context.fill();
				context.globalAlpha = 1;
			}

			// Highlight shine
			const shineGradient = context.createLinearGradient(barX, barY, barX, barY + barHeight * 0.4);
			shineGradient.addColorStop(0, 'rgba(255, 150, 150, 0.4)');
			shineGradient.addColorStop(1, 'rgba(255, 100, 100, 0)');
			context.shadowBlur = 0;
			context.fillStyle = shineGradient;
			this.roundRect(barX + 2, barY + 2, currentBarWidth - 4, barHeight * 0.35, 2);
			context.fill();
		}

		// Health text with ornate styling
		context.shadowBlur = 4;
		context.shadowColor = 'rgba(0, 0, 0, 0.9)';
		context.font = '18px Dungeon';
		context.fillStyle = '#ffffff';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(
			`${Math.ceil(this.displayedHealth)} / ${this.player.maxHealth}`,
			barX + barWidth / 2,
			barY + barHeight / 2 + 1
		);
	}

	/**
	 * Renders the current score with ornate styling
	 */
	renderScore() {
		const scoreText = `${Math.floor(this.displayedScore)}`;
		const labelText = 'SOULS';

		// Measure for positioning
		context.font = '36px Dungeon';
		const scoreWidth = context.measureText(scoreText).width;
		context.font = '14px Dungeon';
		const labelWidth = context.measureText(labelText).width;

		const panelWidth = Math.max(scoreWidth, labelWidth) + 60;
		const panelHeight = 60;
		const panelX = CANVAS_WIDTH - panelWidth - this.padding;
		const panelY = this.padding;

		// Ornate panel background
		context.fillStyle = 'rgba(15, 10, 8, 0.85)';
		this.drawOrnateFrame(panelX, panelY, panelWidth, panelHeight);

		// Soul icon glow
		const iconX = panelX + 24;
		const iconY = panelY + panelHeight / 2;

		const iconGlow = context.createRadialGradient(iconX, iconY, 0, iconX, iconY, 18);
		iconGlow.addColorStop(0, 'rgba(255, 200, 100, 0.6)');
		iconGlow.addColorStop(0.5, 'rgba(255, 180, 50, 0.2)');
		iconGlow.addColorStop(1, 'rgba(255, 150, 0, 0)');
		context.fillStyle = iconGlow;
		context.beginPath();
		context.arc(iconX, iconY, 18, 0, Math.PI * 2);
		context.fill();

		// Soul orb
		context.fillStyle = '#ffd966';
		context.shadowBlur = 10;
		context.shadowColor = 'rgba(255, 200, 100, 0.8)';
		context.beginPath();
		context.arc(iconX, iconY, 8, 0, Math.PI * 2);
		context.fill();

		// Score number
		context.font = '36px Dungeon';
		context.textAlign = 'right';
		context.textBaseline = 'middle';
		context.shadowBlur = 6;
		context.shadowColor = 'rgba(255, 200, 100, 0.8)';
		context.fillStyle = '#ffd966';
		context.fillText(scoreText, panelX + panelWidth - 15, panelY + panelHeight / 2 - 5);

		// Label
		context.font = '14px Dungeon';
		context.fillStyle = '#aa8844';
		context.shadowBlur = 2;
		context.fillText(labelText, panelX + panelWidth - 15, panelY + panelHeight / 2 + 14);

		context.shadowBlur = 0;
	}

	/**
	 * Renders the high score
	 */
	renderHighScore() {
		const scoreText = `Best: ${this.player.highScore}`;

		context.font = '18px Dungeon';
		const textWidth = context.measureText(scoreText).width;
		const panelWidth = textWidth + 28;
		const panelHeight = 28;
		const panelX = CANVAS_WIDTH - panelWidth - this.padding;
		const panelY = this.padding + 66;

		// Small panel
		context.fillStyle = 'rgba(15, 10, 8, 0.75)';
		this.roundRect(panelX, panelY, panelWidth, panelHeight, 4);
		context.fill();

		// Border
		context.strokeStyle = 'rgba(100, 80, 50, 0.6)';
		context.lineWidth = 1;
		this.roundRect(panelX, panelY, panelWidth, panelHeight, 4);
		context.stroke();

		// Text
		context.font = '18px Dungeon';
		context.textAlign = 'right';
		context.textBaseline = 'middle';
		context.shadowBlur = 3;
		context.shadowColor = 'rgba(0, 0, 0, 0.8)';
		context.fillStyle = '#c4a060';
		context.fillText(scoreText, panelX + panelWidth - 14, panelY + panelHeight / 2);

		context.shadowBlur = 0;
	}

	/**
	 * Renders boss health bar at bottom of screen
	 */
	renderBossHealthBar() {
		if (!this.bossEnemy) return;

		const barWidth = Math.min(500, CANVAS_WIDTH * 0.5);
		const barHeight = 20;
		const barX = (CANVAS_WIDTH - barWidth) / 2;
		const barY = CANVAS_HEIGHT - 60;

		context.globalAlpha = this.bossBarAlpha;

		// Boss name
		const bossName = this.bossEnemy.name || 'ANCIENT EVIL';
		context.font = '28px Dungeon';
		context.textAlign = 'center';
		context.textBaseline = 'bottom';
		context.shadowBlur = 8;
		context.shadowColor = 'rgba(150, 0, 0, 0.8)';
		context.fillStyle = '#ff6644';
		context.fillText(bossName, CANVAS_WIDTH / 2, barY - 10);

		// Frame background
		context.fillStyle = 'rgba(20, 10, 10, 0.9)';
		this.roundRect(barX - 10, barY - 5, barWidth + 20, barHeight + 10, 5);
		context.fill();

		// Ornate border
		context.strokeStyle = 'rgba(150, 50, 50, 0.8)';
		context.lineWidth = 2;
		this.roundRect(barX - 10, barY - 5, barWidth + 20, barHeight + 10, 5);
		context.stroke();

		// Corner decorations
		this.drawCornerDecoration(barX - 15, barY - 10, 1);
		this.drawCornerDecoration(barX + barWidth + 15, barY - 10, -1);
		this.drawCornerDecoration(barX - 15, barY + barHeight + 5, 1);
		this.drawCornerDecoration(barX + barWidth + 15, barY + barHeight + 5, -1);

		// Health bar background
		context.fillStyle = 'rgba(60, 20, 20, 0.9)';
		this.roundRect(barX, barY, barWidth, barHeight, 3);
		context.fill();

		// Health percentage
		const healthPercent = this.bossHealthDisplay / this.bossEnemy.totalHealth;
		const currentWidth = barWidth * Math.max(0, healthPercent);

		if (currentWidth > 0) {
			// Boss health gradient (menacing red/purple)
			const healthGradient = context.createLinearGradient(barX, barY, barX, barY + barHeight);
			healthGradient.addColorStop(0, '#cc2244');
			healthGradient.addColorStop(0.3, '#aa1133');
			healthGradient.addColorStop(0.7, '#881133');
			healthGradient.addColorStop(1, '#660022');

			context.shadowBlur = 12;
			context.shadowColor = 'rgba(200, 50, 80, 0.6)';
			context.fillStyle = healthGradient;
			this.roundRect(barX, barY, currentWidth, barHeight, 3);
			context.fill();

			// Pulsing overlay
			const pulse = 0.3 + Math.sin(this.animationTimer * 3) * 0.1;
			context.fillStyle = `rgba(255, 100, 100, ${pulse})`;
			this.roundRect(barX, barY, currentWidth, barHeight, 3);
			context.fill();

			// Shine
			const shine = context.createLinearGradient(barX, barY, barX, barY + barHeight * 0.4);
			shine.addColorStop(0, 'rgba(255, 150, 150, 0.3)');
			shine.addColorStop(1, 'rgba(255, 100, 100, 0)');
			context.shadowBlur = 0;
			context.fillStyle = shine;
			this.roundRect(barX + 2, barY + 2, currentWidth - 4, barHeight * 0.35, 2);
			context.fill();

			// Damage flash overlay (like player healthbar)
			if (this.bossHealthFlashTimer > 0) {
				context.globalAlpha = this.bossBarAlpha * this.bossHealthFlashTimer * 2;
				context.fillStyle = 'rgba(255, 255, 255, 0.6)';
				this.roundRect(barX, barY, currentWidth, barHeight, 3);
				context.fill();
			}
		}

		context.globalAlpha = 1;
		context.shadowBlur = 0;
	}

	/**
	 * Render notification messages
	 */
	renderNotifications() {
		const startY = CANVAS_HEIGHT / 2 - 50;

		this.notifications.forEach((notif, index) => {
			const alpha = Math.min(1, notif.life * 2);
			const y = startY + notif.y;

			context.globalAlpha = alpha;
			context.font = '24px Dungeon';
			context.textAlign = 'center';
			context.textBaseline = 'middle';

			// Color based on type
			const colors = {
				info: '#ffffff',
				warning: '#ffaa00',
				danger: '#ff4444',
				success: '#44ff66',
			};

			context.shadowBlur = 8;
			context.shadowColor = 'rgba(0, 0, 0, 0.8)';
			context.fillStyle = colors[notif.type] || colors.info;
			context.fillText(notif.message, CANVAS_WIDTH / 2, y);
		});

		context.globalAlpha = 1;
		context.shadowBlur = 0;
	}

	/**
	 * Render low health warning overlay
	 */
	renderLowHealthWarning() {
		const pulse = 0.15 + Math.sin(this.lowHealthPulse) * 0.1;

		const gradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.3,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT
		);

		gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		gradient.addColorStop(0.7, `rgba(80, 0, 0, ${pulse})`);
		gradient.addColorStop(1, `rgba(120, 0, 0, ${pulse * 1.5})`);

		context.fillStyle = gradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	/**
	 * Render combo counter with dynamic styling
	 */
	renderComboCounter() {
		const comboX = this.padding + 10;
		const comboY = 90;

		// Color cycling for high combos
		let comboColor;
		if (this.displayedCombo >= 10) {
			// Rainbow effect for massive combos
			const hue = (this.comboColorPhase * 50) % 360;
			comboColor = `hsl(${hue}, 100%, 60%)`;
		} else if (this.displayedCombo >= 5) {
			// Gold for good combos
			comboColor = '#ffd700';
		} else {
			// White for basic combos
			comboColor = '#ffffff';
		}

		context.save();
		context.translate(comboX + 60, comboY);
		context.scale(this.comboScale, this.comboScale);
		context.translate(-comboX - 60, -comboY);

		// Glow effect
		context.shadowBlur = 15 + this.comboFlash * 15;
		context.shadowColor = comboColor;

		// Combo number
		context.font = '32px Dungeon';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillStyle = comboColor;
		context.fillText(`${this.displayedCombo}x`, comboX + 30, comboY);

		// "COMBO" label
		context.font = '14px Dungeon';
		context.shadowBlur = 5;
		context.fillStyle = 'rgba(255, 255, 255, 0.8)';
		context.fillText('COMBO', comboX + 30, comboY + 20);

		// Flash overlay
		if (this.comboFlash > 0) {
			context.globalAlpha = this.comboFlash * 0.5;
			context.fillStyle = '#ffffff';
			context.fillText(`${this.displayedCombo}x`, comboX + 30, comboY);
			context.globalAlpha = 1;
		}

		context.restore();
		context.shadowBlur = 0;
	}

	/**
	 * Render kill tracker in bottom-left corner
	 */
	renderKillTracker() {
		if (this.displayedKills === 0) return;

		const killX = this.padding;
		const killY = CANVAS_HEIGHT - this.padding - 30;

		// Panel background
		const panelWidth = 80;
		const panelHeight = 28;

		context.fillStyle = 'rgba(15, 10, 8, 0.8)';
		this.roundRect(killX, killY, panelWidth, panelHeight, 4);
		context.fill();

		// Border
		context.strokeStyle = 'rgba(100, 60, 60, 0.6)';
		context.lineWidth = 1;
		this.roundRect(killX, killY, panelWidth, panelHeight, 4);
		context.stroke();

		// Skull icon
		context.font = '16px Dungeon';
		context.fillStyle = this.killFlash > 0 ? '#ff6666' : '#aa6666';
		context.shadowBlur = this.killFlash > 0 ? 10 : 3;
		context.shadowColor = 'rgba(255, 100, 100, 0.6)';
		context.textAlign = 'left';
		context.textBaseline = 'middle';
		context.fillText('*', killX + 10, killY + panelHeight / 2);

		// Kill count
		context.font = '18px Dungeon';
		context.fillStyle = this.killFlash > 0 ? '#ffffff' : '#cc9999';
		context.textAlign = 'right';
		context.fillText(`${this.displayedKills}`, killX + panelWidth - 10, killY + panelHeight / 2);

		context.shadowBlur = 0;
	}

	// Helper: Draw ornate frame
	drawOrnateFrame(x, y, width, height) {
		// Main background
		this.roundRect(x, y, width, height, 6);
		context.fill();

		// Border glow
		context.strokeStyle = 'rgba(139, 90, 43, 0.8)';
		context.lineWidth = 2;
		context.shadowBlur = 8;
		context.shadowColor = 'rgba(200, 150, 80, 0.4)';
		this.roundRect(x, y, width, height, 6);
		context.stroke();

		// Inner border
		context.strokeStyle = 'rgba(80, 50, 25, 0.6)';
		context.lineWidth = 1;
		context.shadowBlur = 0;
		this.roundRect(x + 3, y + 3, width - 6, height - 6, 4);
		context.stroke();
	}

	// Helper: Draw skull icon
	drawSkullIcon(x, y) {
		context.fillStyle = 'rgba(200, 180, 150, 0.8)';
		context.font = '14px Dungeon';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText('*!!!', x, y);
	}

	// Helper: Draw corner decoration
	drawCornerDecoration(x, y, direction) {
		context.fillStyle = 'rgba(150, 50, 50, 0.8)';
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(x + 8 * direction, y);
		context.lineTo(x, y + 8);
		context.closePath();
		context.fill();
	}

	// Helper: Rounded rectangle
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
