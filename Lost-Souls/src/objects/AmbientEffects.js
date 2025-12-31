import { CANVAS_WIDTH, CANVAS_HEIGHT, context } from "../globals.js";

/**
 * Enhanced AmbientEffects class for atmospheric dark fantasy visuals
 * Supports multiple effect modes: village, cave, boss, custom
 */
export default class AmbientEffects {
	constructor() {
		// Fog particles
		this.fogParticles = [];
		this.initializeFogParticles();

		// Dust particles
		this.dustParticles = [];
		this.initializeDustParticles();

		// Fireflies (for village)
		this.fireflies = [];
		this.initializeFireflies();

		// Animation timer
		this.animationTimer = 0;

		// Effect mode: 'village', 'cave', 'boss'
		this.mode = 'village';

		// Intensity multiplier
		this.intensity = 1;

		// Lightning effect
		this.lightningTimer = 0;
		this.lightningAlpha = 0;
		this.lightningCooldown = 0;

		// Ambient color tint
		this.colorTint = { r: 10, g: 10, b: 25 };

		// God rays (for village)
		this.godRays = [];
		this.initializeGodRays();
	}

	initializeFogParticles() {
		this.fogParticles = [];
		for (let i = 0; i < 10; i++) {
			this.fogParticles.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * CANVAS_HEIGHT,
				radius: 80 + Math.random() * 150,
				speedX: (Math.random() - 0.5) * 0.2,
				speedY: (Math.random() - 0.5) * 0.1,
				opacity: 0.02 + Math.random() * 0.04,
				phase: Math.random() * Math.PI * 2,
			});
		}
	}

	initializeDustParticles() {
		this.dustParticles = [];
		for (let i = 0; i < 30; i++) {
			this.dustParticles.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * CANVAS_HEIGHT,
				size: 0.5 + Math.random() * 2,
				speedX: (Math.random() - 0.5) * 0.3,
				speedY: Math.random() * 0.2 - 0.3,
				opacity: 0.1 + Math.random() * 0.25,
				flicker: Math.random() * Math.PI * 2,
				color: { r: 200, g: 200, b: 220 },
			});
		}
	}

	initializeFireflies() {
		this.fireflies = [];
		for (let i = 0; i < 15; i++) {
			this.fireflies.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * CANVAS_HEIGHT,
				size: Math.random() * 2 + 1,
				targetX: Math.random() * CANVAS_WIDTH,
				targetY: Math.random() * CANVAS_HEIGHT,
				speed: Math.random() * 0.3 + 0.1,
				blinkPhase: Math.random() * Math.PI * 2,
				blinkSpeed: Math.random() * 2 + 1,
				color: { r: 180, g: 255, b: 120 },
			});
		}
	}

	initializeGodRays() {
		this.godRays = [];
		for (let i = 0; i < 5; i++) {
			this.godRays.push({
				x: Math.random() * CANVAS_WIDTH,
				width: Math.random() * 60 + 30,
				opacity: Math.random() * 0.08 + 0.02,
				phase: Math.random() * Math.PI * 2,
				speed: Math.random() * 0.5 + 0.2,
			});
		}
	}

	/**
	 * Set the ambient effect mode
	 */
	setMode(mode) {
		this.mode = mode;

		switch (mode) {
			case 'village':
				this.colorTint = { r: 20, g: 15, b: 10 };
				this.intensity = 0.7;
				break;
			case 'cave':
				this.colorTint = { r: 10, g: 10, b: 25 };
				this.intensity = 1;
				break;
			case 'boss':
				this.colorTint = { r: 20, g: 5, b: 15 };
				this.intensity = 1.3;
				break;
			default:
				this.colorTint = { r: 10, g: 10, b: 20 };
				this.intensity = 1;
		}
	}

	/**
	 * Trigger a lightning flash
	 */
	triggerLightning() {
		if (this.lightningCooldown <= 0) {
			this.lightningAlpha = 0.8;
			this.lightningTimer = 0;
			this.lightningCooldown = Math.random() * 5 + 3;
		}
	}

	update(dt) {
		this.animationTimer += dt;

		// Update lightning
		if (this.lightningAlpha > 0) {
			this.lightningTimer += dt;
			// Flicker effect
			if (this.lightningTimer < 0.1) {
				this.lightningAlpha = Math.random() > 0.5 ? 0.8 : 0.3;
			} else if (this.lightningTimer < 0.2) {
				this.lightningAlpha = Math.random() > 0.5 ? 0.5 : 0.1;
			} else {
				this.lightningAlpha = Math.max(0, this.lightningAlpha - dt * 3);
			}
		}
		this.lightningCooldown = Math.max(0, this.lightningCooldown - dt);

		// Update fog particles
		this.fogParticles.forEach(fog => {
			fog.x += fog.speedX;
			fog.y += fog.speedY;
			fog.phase += dt * 0.5;

			if (fog.x < -fog.radius) fog.x = CANVAS_WIDTH + fog.radius;
			if (fog.x > CANVAS_WIDTH + fog.radius) fog.x = -fog.radius;
			if (fog.y < -fog.radius) fog.y = CANVAS_HEIGHT + fog.radius;
			if (fog.y > CANVAS_HEIGHT + fog.radius) fog.y = -fog.radius;
		});

		// Update dust particles
		this.dustParticles.forEach(dust => {
			dust.x += dust.speedX;
			dust.y += dust.speedY;
			dust.flicker += dt * 3;

			if (dust.y < -10) {
				dust.y = CANVAS_HEIGHT + 10;
				dust.x = Math.random() * CANVAS_WIDTH;
			}
			if (dust.x < -10) dust.x = CANVAS_WIDTH + 10;
			if (dust.x > CANVAS_WIDTH + 10) dust.x = -10;
		});

		// Update fireflies (village mode)
		if (this.mode === 'village') {
			this.fireflies.forEach(ff => {
				// Move towards target
				const dx = ff.targetX - ff.x;
				const dy = ff.targetY - ff.y;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (dist < 10) {
					// Pick new target
					ff.targetX = Math.random() * CANVAS_WIDTH;
					ff.targetY = Math.random() * CANVAS_HEIGHT;
				} else {
					ff.x += (dx / dist) * ff.speed;
					ff.y += (dy / dist) * ff.speed;
				}

				ff.blinkPhase += ff.blinkSpeed * dt;
			});
		}

		// Update god rays
		this.godRays.forEach(ray => {
			ray.phase += ray.speed * dt;
			ray.x += Math.sin(ray.phase) * 0.2;
		});
	}

	render() {
		context.save();

		// Render based on mode
		switch (this.mode) {
			case 'village':
				this.renderVillageAmbience();
				break;
			case 'cave':
				this.renderCaveAmbience();
				break;
			case 'boss':
				this.renderBossAmbience();
				break;
			default:
				this.renderDefaultAmbience();
		}

		// Render lightning if active
		if (this.lightningAlpha > 0) {
			context.fillStyle = `rgba(200, 220, 255, ${this.lightningAlpha * 0.4})`;
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		}

		context.restore();
	}

	renderVillageAmbience() {
		// Light fog
		this.renderFog(0.5);

		// Fireflies
		this.renderFireflies();

		// God rays
		this.renderGodRays();

		// Light vignette
		this.renderVignette(0.3, 0.5);

		// Warm color grading
		context.fillStyle = 'rgba(30, 20, 10, 0.08)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	renderCaveAmbience() {
		// Heavy fog
		this.renderFog(1);

		// Dust particles
		this.renderDust();

		// Dark vignette
		this.renderVignette(0.6, 0.85);

		// Cold color grading
		this.renderColorGrading();

		// Film grain
		this.renderFilmGrain();
	}

	renderBossAmbience() {
		// Ominous fog
		this.renderFog(1.2);

		// Dust
		this.renderDust();

		// Very dark vignette with red tint
		this.renderBossVignette();

		// Dark red color grading
		context.fillStyle = 'rgba(20, 5, 10, 0.2)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Film grain
		this.renderFilmGrain();
	}

	renderDefaultAmbience() {
		this.renderFog(0.8);
		this.renderDust();
		this.renderVignette(0.5, 0.75);
		this.renderColorGrading();
	}

	renderFog(intensityMultiplier = 1) {
		this.fogParticles.forEach(fog => {
			const oscillation = Math.sin(fog.phase) * 0.3 + 1;
			const currentOpacity = fog.opacity * oscillation * this.intensity * intensityMultiplier;

			const gradient = context.createRadialGradient(
				fog.x, fog.y, 0,
				fog.x, fog.y, fog.radius
			);

			gradient.addColorStop(0, `rgba(${this.colorTint.r + 10}, ${this.colorTint.g + 10}, ${this.colorTint.b + 10}, ${currentOpacity * 0.8})`);
			gradient.addColorStop(0.5, `rgba(${this.colorTint.r}, ${this.colorTint.g}, ${this.colorTint.b}, ${currentOpacity * 0.5})`);
			gradient.addColorStop(1, 'rgba(10, 10, 20, 0)');

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(fog.x, fog.y, fog.radius, 0, Math.PI * 2);
			context.fill();
		});
	}

	renderDust() {
		this.dustParticles.forEach(dust => {
			const flickerOpacity = dust.opacity * (0.7 + Math.sin(dust.flicker) * 0.3) * this.intensity;

			context.save();
			context.globalAlpha = flickerOpacity;

			const gradient = context.createRadialGradient(
				dust.x, dust.y, 0,
				dust.x, dust.y, dust.size * 2
			);
			gradient.addColorStop(0, `rgba(${dust.color.r}, ${dust.color.g}, ${dust.color.b}, 0.5)`);
			gradient.addColorStop(1, `rgba(${dust.color.r}, ${dust.color.g}, ${dust.color.b}, 0)`);

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(dust.x, dust.y, dust.size * 2, 0, Math.PI * 2);
			context.fill();

			context.fillStyle = `rgba(${dust.color.r + 20}, ${dust.color.g + 20}, ${dust.color.b + 20}, 0.7)`;
			context.beginPath();
			context.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
			context.fill();

			context.restore();
		});
	}

	renderFireflies() {
		this.fireflies.forEach(ff => {
			const blinkIntensity = 0.3 + Math.max(0, Math.sin(ff.blinkPhase)) * 0.7;

			context.globalAlpha = blinkIntensity;

			// Glow
			const gradient = context.createRadialGradient(
				ff.x, ff.y, 0,
				ff.x, ff.y, ff.size * 5
			);
			gradient.addColorStop(0, `rgba(${ff.color.r}, ${ff.color.g}, ${ff.color.b}, 0.8)`);
			gradient.addColorStop(0.3, `rgba(${ff.color.r}, ${ff.color.g}, ${ff.color.b}, 0.3)`);
			gradient.addColorStop(1, 'rgba(180, 255, 120, 0)');

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(ff.x, ff.y, ff.size * 5, 0, Math.PI * 2);
			context.fill();

			// Core
			context.fillStyle = 'rgba(220, 255, 180, 0.9)';
			context.beginPath();
			context.arc(ff.x, ff.y, ff.size, 0, Math.PI * 2);
			context.fill();
		});

		context.globalAlpha = 1;
	}

	renderGodRays() {
		context.globalAlpha = 0.1;

		this.godRays.forEach(ray => {
			const shimmer = 0.7 + Math.sin(ray.phase) * 0.3;
			context.globalAlpha = ray.opacity * shimmer;

			const gradient = context.createLinearGradient(
				ray.x, 0,
				ray.x, CANVAS_HEIGHT
			);
			gradient.addColorStop(0, 'rgba(255, 240, 200, 0.3)');
			gradient.addColorStop(0.5, 'rgba(255, 230, 180, 0.15)');
			gradient.addColorStop(1, 'rgba(255, 220, 160, 0)');

			context.fillStyle = gradient;
			context.beginPath();
			context.moveTo(ray.x - ray.width / 2, 0);
			context.lineTo(ray.x + ray.width / 2, 0);
			context.lineTo(ray.x + ray.width, CANVAS_HEIGHT);
			context.lineTo(ray.x - ray.width, CANVAS_HEIGHT);
			context.closePath();
			context.fill();
		});

		context.globalAlpha = 1;
	}

	renderVignette(innerOpacity = 0.2, outerOpacity = 0.75) {
		const vignetteGradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.2,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.85
		);

		vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		vignetteGradient.addColorStop(0.5, `rgba(0, 0, 0, ${innerOpacity})`);
		vignetteGradient.addColorStop(0.8, `rgba(0, 0, 0, ${(innerOpacity + outerOpacity) / 2})`);
		vignetteGradient.addColorStop(1, `rgba(0, 0, 0, ${outerOpacity})`);

		context.fillStyle = vignetteGradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	renderBossVignette() {
		const vignetteGradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.1,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.9
		);

		vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		vignetteGradient.addColorStop(0.3, 'rgba(20, 0, 5, 0.3)');
		vignetteGradient.addColorStop(0.6, 'rgba(40, 5, 10, 0.6)');
		vignetteGradient.addColorStop(1, 'rgba(30, 0, 10, 0.9)');

		context.fillStyle = vignetteGradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Pulsing red overlay
		const pulse = 0.05 + Math.sin(this.animationTimer * 2) * 0.03;
		context.fillStyle = `rgba(50, 0, 10, ${pulse})`;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	renderColorGrading() {
		const tint = this.colorTint;
		context.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, 0.15)`;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	renderFilmGrain() {
		const pulseOpacity = 0.02 + Math.sin(this.animationTimer * 10) * 0.01;
		context.fillStyle = `rgba(${Math.random() * 20}, ${Math.random() * 20}, ${Math.random() * 20}, ${pulseOpacity})`;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	/**
	 * Light ambience for safe areas
	 */
	renderLightAmbience() {
		context.save();
		this.renderVignette(0.1, 0.3);
		context.restore();
	}

	/**
	 * Heavy ambience for dangerous areas
	 */
	renderHeavyAmbience() {
		context.save();
		this.renderFog(1.5);
		this.renderDust();
		this.renderVignette(0.7, 0.9);
		context.fillStyle = 'rgba(5, 5, 15, 0.25)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		context.restore();
	}
}
