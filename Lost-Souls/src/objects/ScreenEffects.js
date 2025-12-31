import { CANVAS_WIDTH, CANVAS_HEIGHT, context } from "../globals.js";

/**
 * Screen Effects Manager - handles screen shake, flash, fade, and other screen-wide effects
 */
export default class ScreenEffects {
	constructor() {
		// Screen shake
		this.shakeIntensity = 0;
		this.shakeDuration = 0;
		this.shakeTimer = 0;
		this.shakeOffsetX = 0;
		this.shakeOffsetY = 0;
		this.shakeDecay = true;

		// Screen flash
		this.flashColor = { r: 255, g: 255, b: 255 };
		this.flashAlpha = 0;
		this.flashDuration = 0;
		this.flashTimer = 0;

		// Screen fade
		this.fadeAlpha = 0;
		this.fadeTarget = 0;
		this.fadeSpeed = 1;
		this.fadeColor = { r: 0, g: 0, b: 0 };
		this.fadeCallback = null;

		// Chromatic aberration
		this.chromaticIntensity = 0;
		this.chromaticDuration = 0;
		this.chromaticTimer = 0;

		// Slow motion / time dilation visual
		this.slowMoIntensity = 0;

		// Lightning flash
		this.lightningAlpha = 0;
		this.lightningDuration = 0;
		this.lightningTimer = 0;
		this.lightningFlickers = 0;

		// Damage vignette (red pulse)
		this.damageIntensity = 0;
		this.damageDuration = 0;
		this.damageTimer = 0;

		// Focus vignette (boss encounters)
		this.focusIntensity = 0;
		this.focusTarget = 0;
		this.focusSpeed = 1;

		// Color overlay
		this.overlayColor = null;
		this.overlayAlpha = 0;
		this.overlayTarget = 0;
		this.overlaySpeed = 1;

		// Distortion wave (for impacts, explosions)
		this.distortionWaves = [];

		// Rain overlay
		this.rainIntensity = 0;
		this.rainDrops = [];
	}

	/**
	 * Shake the screen
	 */
	shake(intensity = 5, duration = 0.3, decay = true) {
		this.shakeIntensity = intensity;
		this.shakeDuration = duration;
		this.shakeTimer = 0;
		this.shakeDecay = decay;
	}

	/**
	 * Flash the screen (for hits, lightning)
	 */
	flash(color = { r: 255, g: 255, b: 255 }, duration = 0.1, intensity = 0.8) {
		this.flashColor = color;
		this.flashAlpha = intensity;
		this.flashDuration = duration;
		this.flashTimer = 0;
	}

	/**
	 * Fade to/from black or other color
	 */
	fade(toAlpha, duration = 1, color = { r: 0, g: 0, b: 0 }, callback = null) {
		this.fadeTarget = toAlpha;
		this.fadeSpeed = Math.abs(toAlpha - this.fadeAlpha) / duration;
		this.fadeColor = color;
		this.fadeCallback = callback;
	}

	/**
	 * Quick fade out then in (scene transition)
	 */
	fadeOutIn(duration = 0.5, color = { r: 0, g: 0, b: 0 }, middleCallback = null) {
		this.fade(1, duration / 2, color, () => {
			if (middleCallback) middleCallback();
			this.fade(0, duration / 2, color);
		});
	}

	/**
	 * Lightning flash effect (multiple flickers)
	 */
	lightning(intensity = 1, flickers = 3) {
		this.lightningAlpha = intensity;
		this.lightningFlickers = flickers;
		this.lightningTimer = 0;
		this.lightningDuration = 0.1 * flickers;
	}

	/**
	 * Damage vignette pulse
	 */
	damageFlash(intensity = 0.5, duration = 0.3) {
		this.damageIntensity = intensity;
		this.damageDuration = duration;
		this.damageTimer = 0;
	}

	/**
	 * Focus vignette (for boss fights, important moments)
	 */
	setFocus(intensity, speed = 2) {
		this.focusTarget = intensity;
		this.focusSpeed = speed;
	}

	/**
	 * Color overlay (tint the whole screen)
	 */
	setOverlay(color, alpha, speed = 2) {
		this.overlayColor = color;
		this.overlayTarget = alpha;
		this.overlaySpeed = speed;
	}

	/**
	 * Create a distortion wave (ripple effect from a point)
	 */
	distortionWave(x, y, maxRadius = 200, duration = 0.5) {
		this.distortionWaves.push({
			x, y,
			radius: 0,
			maxRadius,
			duration,
			timer: 0,
		});
	}

	/**
	 * Initialize rain effect
	 */
	startRain(intensity = 0.5) {
		this.rainIntensity = intensity;
		this.rainDrops = [];

		const count = Math.floor(200 * intensity);
		for (let i = 0; i < count; i++) {
			this.rainDrops.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * CANVAS_HEIGHT,
				length: Math.random() * 20 + 10,
				speed: Math.random() * 10 + 15,
				wind: -2,
			});
		}
	}

	stopRain() {
		this.rainIntensity = 0;
	}

	update(dt) {
		// Update shake
		if (this.shakeTimer < this.shakeDuration) {
			this.shakeTimer += dt;
			let intensity = this.shakeIntensity;
			if (this.shakeDecay) {
				intensity *= 1 - (this.shakeTimer / this.shakeDuration);
			}
			this.shakeOffsetX = (Math.random() - 0.5) * 2 * intensity;
			this.shakeOffsetY = (Math.random() - 0.5) * 2 * intensity;
		} else {
			this.shakeOffsetX = 0;
			this.shakeOffsetY = 0;
		}

		// Update flash
		if (this.flashTimer < this.flashDuration) {
			this.flashTimer += dt;
		} else {
			this.flashAlpha = 0;
		}

		// Update fade
		if (this.fadeAlpha !== this.fadeTarget) {
			const direction = this.fadeTarget > this.fadeAlpha ? 1 : -1;
			this.fadeAlpha += direction * this.fadeSpeed * dt;

			if ((direction > 0 && this.fadeAlpha >= this.fadeTarget) ||
				(direction < 0 && this.fadeAlpha <= this.fadeTarget)) {
				this.fadeAlpha = this.fadeTarget;
				if (this.fadeCallback) {
					this.fadeCallback();
					this.fadeCallback = null;
				}
			}
		}

		// Update lightning
		if (this.lightningTimer < this.lightningDuration) {
			this.lightningTimer += dt;
			// Flickering effect
			const flickerProgress = this.lightningTimer / this.lightningDuration;
			const flickerIndex = Math.floor(flickerProgress * this.lightningFlickers);
			const flickerPhase = (flickerProgress * this.lightningFlickers) % 1;
			this.lightningAlpha = flickerPhase < 0.3 ? (1 - flickerProgress) : 0;
		} else {
			this.lightningAlpha = 0;
		}

		// Update damage vignette
		if (this.damageTimer < this.damageDuration) {
			this.damageTimer += dt;
		} else {
			this.damageIntensity = 0;
		}

		// Update focus
		if (this.focusIntensity !== this.focusTarget) {
			const direction = this.focusTarget > this.focusIntensity ? 1 : -1;
			this.focusIntensity += direction * this.focusSpeed * dt;
			if ((direction > 0 && this.focusIntensity >= this.focusTarget) ||
				(direction < 0 && this.focusIntensity <= this.focusTarget)) {
				this.focusIntensity = this.focusTarget;
			}
		}

		// Update overlay
		if (this.overlayAlpha !== this.overlayTarget) {
			const direction = this.overlayTarget > this.overlayAlpha ? 1 : -1;
			this.overlayAlpha += direction * this.overlaySpeed * dt;
			if ((direction > 0 && this.overlayAlpha >= this.overlayTarget) ||
				(direction < 0 && this.overlayAlpha <= this.overlayTarget)) {
				this.overlayAlpha = this.overlayTarget;
			}
		}

		// Update distortion waves
		for (let i = this.distortionWaves.length - 1; i >= 0; i--) {
			const wave = this.distortionWaves[i];
			wave.timer += dt;
			wave.radius = (wave.timer / wave.duration) * wave.maxRadius;
			if (wave.timer >= wave.duration) {
				this.distortionWaves.splice(i, 1);
			}
		}

		// Update rain
		if (this.rainIntensity > 0) {
			this.rainDrops.forEach(drop => {
				drop.y += drop.speed;
				drop.x += drop.wind;

				if (drop.y > CANVAS_HEIGHT + drop.length) {
					drop.y = -drop.length;
					drop.x = Math.random() * (CANVAS_WIDTH + 100) - 50;
				}
				if (drop.x < -50) {
					drop.x = CANVAS_WIDTH + 50;
				}
			});
		}
	}

	/**
	 * Apply screen shake transform (call before rendering game content)
	 */
	applyShake() {
		if (this.shakeOffsetX !== 0 || this.shakeOffsetY !== 0) {
			context.translate(this.shakeOffsetX, this.shakeOffsetY);
		}
	}

	/**
	 * Render all screen effects (call after rendering game content)
	 */
	render() {
		context.save();

		// Render rain (behind other effects)
		if (this.rainIntensity > 0) {
			this.renderRain();
		}

		// Render distortion waves
		this.renderDistortionWaves();

		// Render lightning
		if (this.lightningAlpha > 0) {
			context.fillStyle = `rgba(200, 220, 255, ${this.lightningAlpha * 0.7})`;
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		}

		// Render flash
		if (this.flashAlpha > 0) {
			const progress = this.flashTimer / this.flashDuration;
			const alpha = this.flashAlpha * (1 - progress);
			const c = this.flashColor;
			context.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		}

		// Render damage vignette
		if (this.damageIntensity > 0) {
			this.renderDamageVignette();
		}

		// Render focus vignette
		if (this.focusIntensity > 0) {
			this.renderFocusVignette();
		}

		// Render color overlay
		if (this.overlayColor && this.overlayAlpha > 0) {
			const c = this.overlayColor;
			context.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${this.overlayAlpha})`;
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		}

		// Render fade
		if (this.fadeAlpha > 0) {
			const c = this.fadeColor;
			context.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${this.fadeAlpha})`;
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		}

		context.restore();
	}

	renderDamageVignette() {
		const progress = this.damageTimer / this.damageDuration;
		const intensity = this.damageIntensity * (1 - progress);

		const gradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.3,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.9
		);

		gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		gradient.addColorStop(0.5, `rgba(100, 0, 0, ${intensity * 0.3})`);
		gradient.addColorStop(1, `rgba(150, 20, 20, ${intensity * 0.6})`);

		context.fillStyle = gradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	renderFocusVignette() {
		const gradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.2,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.85
		);

		gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		gradient.addColorStop(0.5, `rgba(0, 0, 0, ${this.focusIntensity * 0.3})`);
		gradient.addColorStop(0.8, `rgba(0, 0, 0, ${this.focusIntensity * 0.6})`);
		gradient.addColorStop(1, `rgba(0, 0, 0, ${this.focusIntensity * 0.85})`);

		context.fillStyle = gradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	renderRain() {
		context.globalAlpha = 0.4 * this.rainIntensity;
		context.strokeStyle = 'rgba(150, 180, 220, 0.6)';
		context.lineWidth = 1;

		this.rainDrops.forEach(drop => {
			context.beginPath();
			context.moveTo(drop.x, drop.y);
			context.lineTo(drop.x + drop.wind * 0.5, drop.y + drop.length);
			context.stroke();
		});

		context.globalAlpha = 1;
	}

	renderDistortionWaves() {
		this.distortionWaves.forEach(wave => {
			const progress = wave.timer / wave.duration;
			const alpha = (1 - progress) * 0.3;

			context.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
			context.lineWidth = 2;
			context.beginPath();
			context.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
			context.stroke();

			// Inner ring
			context.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
			context.lineWidth = 1;
			context.beginPath();
			context.arc(wave.x, wave.y, wave.radius * 0.8, 0, Math.PI * 2);
			context.stroke();
		});
	}

	/**
	 * Check if any blocking effects are active (for transitions)
	 */
	isBlocking() {
		return this.fadeAlpha >= 0.99;
	}
}
