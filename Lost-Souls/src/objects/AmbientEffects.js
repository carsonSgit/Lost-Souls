import { CANVAS_WIDTH, CANVAS_HEIGHT, context } from "../globals.js";

/**
 * AmbientEffects class for rendering atmospheric dark effects
 * Adds fog, particles, vignettes, and color grading for dark ambience
 */
export default class AmbientEffects {
	constructor() {
		// Fog particles
		this.fogParticles = [];
		this.initializeFogParticles();

		// Dust particles
		this.dustParticles = [];
		this.initializeDustParticles();

		// Animation timer
		this.animationTimer = 0;
	}

	initializeFogParticles() {
		// Create large, slow-moving fog clouds
		for (let i = 0; i < 8; i++) {
			this.fogParticles.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * CANVAS_HEIGHT,
				radius: 80 + Math.random() * 120,
				speedX: (Math.random() - 0.5) * 0.15,
				speedY: (Math.random() - 0.5) * 0.08,
				opacity: 0.03 + Math.random() * 0.05,
				phase: Math.random() * Math.PI * 2,
			});
		}
	}

	initializeDustParticles() {
		// Create small dust particles
		for (let i = 0; i < 25; i++) {
			this.dustParticles.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * CANVAS_HEIGHT,
				size: 0.5 + Math.random() * 1.5,
				speedX: (Math.random() - 0.5) * 0.3,
				speedY: Math.random() * 0.2 - 0.3,
				opacity: 0.1 + Math.random() * 0.2,
				flicker: Math.random() * Math.PI * 2,
			});
		}
	}

	update(dt) {
		this.animationTimer += dt;

		// Update fog particles
		this.fogParticles.forEach(fog => {
			fog.x += fog.speedX;
			fog.y += fog.speedY;
			fog.phase += dt * 0.5;

			// Wrap around screen
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

			// Reset particles when they go off screen
			if (dust.y < -10) {
				dust.y = CANVAS_HEIGHT + 10;
				dust.x = Math.random() * CANVAS_WIDTH;
			}
			if (dust.x < -10) dust.x = CANVAS_WIDTH + 10;
			if (dust.x > CANVAS_WIDTH + 10) dust.x = -10;
		});
	}

	render() {
		context.save();

		// Render fog layers
		this.renderFog();

		// Render dust particles
		this.renderDust();

		// Render dark vignette
		this.renderVignette();

		// Render color grading overlay
		this.renderColorGrading();

		context.restore();
	}

	renderFog() {
		this.fogParticles.forEach(fog => {
			const oscillation = Math.sin(fog.phase) * 0.2 + 1;
			const currentOpacity = fog.opacity * oscillation;

			// Create radial gradient for fog
			const gradient = context.createRadialGradient(
				fog.x, fog.y, 0,
				fog.x, fog.y, fog.radius
			);

			gradient.addColorStop(0, `rgba(20, 20, 30, ${currentOpacity * 0.8})`);
			gradient.addColorStop(0.5, `rgba(15, 15, 25, ${currentOpacity * 0.5})`);
			gradient.addColorStop(1, 'rgba(10, 10, 20, 0)');

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(fog.x, fog.y, fog.radius, 0, Math.PI * 2);
			context.fill();
		});
	}

	renderDust() {
		this.dustParticles.forEach(dust => {
			const flickerOpacity = dust.opacity * (0.7 + Math.sin(dust.flicker) * 0.3);

			context.save();
			context.globalAlpha = flickerOpacity;

			// Dust particle with subtle glow
			const gradient = context.createRadialGradient(
				dust.x, dust.y, 0,
				dust.x, dust.y, dust.size * 2
			);
			gradient.addColorStop(0, 'rgba(180, 180, 200, 0.4)');
			gradient.addColorStop(1, 'rgba(100, 100, 120, 0)');

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(dust.x, dust.y, dust.size * 2, 0, Math.PI * 2);
			context.fill();

			// Core
			context.fillStyle = 'rgba(200, 200, 220, 0.6)';
			context.beginPath();
			context.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
			context.fill();

			context.restore();
		});
	}

	renderVignette() {
		// Strong dark vignette for atmospheric depth
		const vignetteGradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.2,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.85
		);

		vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		vignetteGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
		vignetteGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.5)');
		vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.75)');

		context.fillStyle = vignetteGradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	renderColorGrading() {
		// Subtle dark blue overlay for cold, ominous atmosphere
		context.fillStyle = 'rgba(10, 10, 25, 0.15)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Add subtle film grain effect
		const pulseOpacity = 0.02 + Math.sin(this.animationTimer * 10) * 0.01;
		context.fillStyle = `rgba(${Math.random() * 20}, ${Math.random() * 20}, ${Math.random() * 20}, ${pulseOpacity})`;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	/**
	 * Render lighter ambient effects for victory/safe areas
	 */
	renderLightAmbience() {
		context.save();

		// Lighter vignette
		const vignetteGradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.3,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.8
		);

		vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
		vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

		context.fillStyle = vignetteGradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		context.restore();
	}

	/**
	 * Render heavy dark ambient effects for dangerous areas (caves, boss arena)
	 */
	renderHeavyAmbience() {
		context.save();

		// Render fog
		this.renderFog();

		// Render dust
		this.renderDust();

		// Very dark vignette
		const vignetteGradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.15,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.85
		);

		vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		vignetteGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.4)');
		vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.7)');
		vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');

		context.fillStyle = vignetteGradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Heavy dark overlay
		context.fillStyle = 'rgba(5, 5, 15, 0.25)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		context.restore();
	}
}
