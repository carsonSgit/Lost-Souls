import { CANVAS_WIDTH, CANVAS_HEIGHT, context } from "../globals.js";

/**
 * Advanced Particle System for dark fantasy environmental effects
 * Supports multiple particle types: embers, rain, snow, dust, blood, souls, lightning
 */
export default class ParticleSystem {
	constructor() {
		this.particles = [];
		this.emitters = [];
		this.maxParticles = 500;
	}

	/**
	 * Create particles of a specific type
	 */
	emit(type, x, y, count = 1, options = {}) {
		const creators = {
			ember: this.createEmber.bind(this),
			rain: this.createRain.bind(this),
			dust: this.createDust.bind(this),
			blood: this.createBlood.bind(this),
			soul: this.createSoul.bind(this),
			spark: this.createSpark.bind(this),
			smoke: this.createSmoke.bind(this),
			firefly: this.createFirefly.bind(this),
			ash: this.createAsh.bind(this),
			magic: this.createMagic.bind(this),
			impact: this.createImpact.bind(this),
			heal: this.createHeal.bind(this),
		};

		const creator = creators[type];
		if (!creator) return;

		for (let i = 0; i < count; i++) {
			if (this.particles.length < this.maxParticles) {
				this.particles.push(creator(x, y, options));
			}
		}
	}

	/**
	 * Create a continuous emitter
	 */
	addEmitter(type, x, y, rate, options = {}) {
		const emitter = {
			type,
			x,
			y,
			rate,
			options,
			timer: 0,
			active: true,
		};
		this.emitters.push(emitter);
		return emitter;
	}

	removeEmitter(emitter) {
		const index = this.emitters.indexOf(emitter);
		if (index > -1) {
			this.emitters.splice(index, 1);
		}
	}

	// Ember - floating fire particles
	createEmber(x, y, options) {
		return {
			type: 'ember',
			x: x + (Math.random() - 0.5) * (options.spread || 20),
			y: y + (Math.random() - 0.5) * (options.spread || 20),
			vx: (Math.random() - 0.5) * 0.5,
			vy: -Math.random() * 1.5 - 0.5,
			size: Math.random() * 3 + 1,
			life: 1,
			maxLife: Math.random() * 2 + 1.5,
			decay: 0.3 + Math.random() * 0.3,
			color: options.color || { r: 255, g: 150, b: 50 },
			glow: true,
			flickerSpeed: Math.random() * 5 + 3,
			flickerPhase: Math.random() * Math.PI * 2,
		};
	}

	// Rain drops
	createRain(x, y, options) {
		return {
			type: 'rain',
			x: x || Math.random() * CANVAS_WIDTH,
			y: y || -10,
			vx: options.windSpeed || -1,
			vy: Math.random() * 8 + 12,
			length: Math.random() * 15 + 10,
			life: 1,
			maxLife: 3,
			decay: 0,
			color: { r: 150, g: 180, b: 220, a: 0.4 },
			glow: false,
		};
	}

	// Ambient dust
	createDust(x, y, options) {
		return {
			type: 'dust',
			x: x || Math.random() * CANVAS_WIDTH,
			y: y || Math.random() * CANVAS_HEIGHT,
			vx: (Math.random() - 0.5) * 0.3,
			vy: (Math.random() - 0.5) * 0.2,
			size: Math.random() * 2 + 0.5,
			life: 1,
			maxLife: Math.random() * 4 + 3,
			decay: 0.15,
			color: options.color || { r: 200, g: 200, b: 220 },
			glow: true,
			glowSize: 2,
			flickerSpeed: Math.random() * 2 + 1,
			flickerPhase: Math.random() * Math.PI * 2,
		};
	}

	// Blood splatter
	createBlood(x, y, options) {
		const angle = options.angle || Math.random() * Math.PI * 2;
		const speed = Math.random() * 4 + 2;
		return {
			type: 'blood',
			x,
			y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed - 2,
			gravity: 0.3,
			size: Math.random() * 4 + 2,
			life: 1,
			maxLife: 1,
			decay: 0.8,
			color: { r: 150, g: 20, b: 20 },
			glow: false,
		};
	}

	// Floating souls (for death/dark areas)
	createSoul(x, y, options) {
		return {
			type: 'soul',
			x: x + (Math.random() - 0.5) * 30,
			y: y + (Math.random() - 0.5) * 30,
			vx: (Math.random() - 0.5) * 0.5,
			vy: -Math.random() * 0.8 - 0.3,
			size: Math.random() * 6 + 3,
			life: 1,
			maxLife: Math.random() * 3 + 2,
			decay: 0.25,
			color: options.color || { r: 180, g: 220, b: 255 },
			glow: true,
			glowSize: 8,
			waveAmplitude: Math.random() * 2 + 1,
			waveSpeed: Math.random() * 2 + 1,
			wavePhase: Math.random() * Math.PI * 2,
		};
	}

	// Sparks (for impacts, metal clashing)
	createSpark(x, y, options) {
		const angle = options.angle !== undefined ? options.angle : Math.random() * Math.PI * 2;
		const speed = Math.random() * 6 + 3;
		return {
			type: 'spark',
			x,
			y,
			vx: Math.cos(angle) * speed + (options.vx || 0),
			vy: Math.sin(angle) * speed + (options.vy || 0),
			gravity: 0.2,
			size: Math.random() * 2 + 1,
			life: 1,
			maxLife: 0.5,
			decay: 1.5,
			color: options.color || { r: 255, g: 220, b: 100 },
			glow: true,
			trail: [],
			maxTrail: 5,
		};
	}

	// Smoke
	createSmoke(x, y, options) {
		return {
			type: 'smoke',
			x: x + (Math.random() - 0.5) * 10,
			y,
			vx: (Math.random() - 0.5) * 0.3,
			vy: -Math.random() * 0.8 - 0.3,
			size: Math.random() * 10 + 8,
			life: 1,
			maxLife: Math.random() * 2 + 1.5,
			decay: 0.4,
			color: options.color || { r: 60, g: 60, b: 70 },
			glow: false,
			growRate: 0.5,
		};
	}

	// Fireflies (for village/forest areas)
	createFirefly(x, y, options) {
		return {
			type: 'firefly',
			x: x || Math.random() * CANVAS_WIDTH,
			y: y || Math.random() * CANVAS_HEIGHT,
			vx: (Math.random() - 0.5) * 0.5,
			vy: (Math.random() - 0.5) * 0.5,
			size: Math.random() * 2 + 1,
			life: 1,
			maxLife: Math.random() * 5 + 3,
			decay: 0.15,
			color: { r: 200, g: 255, b: 150 },
			glow: true,
			glowSize: 6,
			blinkSpeed: Math.random() * 3 + 2,
			blinkPhase: Math.random() * Math.PI * 2,
			wanderAngle: Math.random() * Math.PI * 2,
			wanderSpeed: 0.05,
		};
	}

	// Ash particles (for burned/dark areas)
	createAsh(x, y, options) {
		return {
			type: 'ash',
			x: x || Math.random() * CANVAS_WIDTH,
			y: y || -10,
			vx: (Math.random() - 0.5) * 0.5 + (options.windSpeed || 0),
			vy: Math.random() * 0.5 + 0.3,
			size: Math.random() * 2 + 1,
			life: 1,
			maxLife: Math.random() * 4 + 3,
			decay: 0.2,
			color: { r: 80, g: 80, b: 90 },
			rotation: Math.random() * Math.PI * 2,
			rotationSpeed: (Math.random() - 0.5) * 0.1,
			swayAmplitude: Math.random() * 2 + 1,
			swaySpeed: Math.random() * 2 + 1,
			swayPhase: Math.random() * Math.PI * 2,
		};
	}

	// Magic particles (for spells, abilities)
	createMagic(x, y, options) {
		const angle = Math.random() * Math.PI * 2;
		const dist = Math.random() * 20;
		return {
			type: 'magic',
			x: x + Math.cos(angle) * dist,
			y: y + Math.sin(angle) * dist,
			targetX: x,
			targetY: y,
			orbitRadius: dist,
			orbitAngle: angle,
			orbitSpeed: (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1),
			size: Math.random() * 3 + 1,
			life: 1,
			maxLife: Math.random() * 1 + 0.5,
			decay: 0.8,
			color: options.color || { r: 150, g: 100, b: 255 },
			glow: true,
			glowSize: 5,
		};
	}

	// Impact burst (for hits, explosions)
	createImpact(x, y, options) {
		const angle = Math.random() * Math.PI * 2;
		const speed = Math.random() * 5 + 2;
		return {
			type: 'impact',
			x,
			y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			size: Math.random() * 4 + 2,
			life: 1,
			maxLife: 0.3,
			decay: 2.5,
			color: options.color || { r: 255, g: 255, b: 200 },
			glow: true,
			glowSize: 4,
		};
	}

	// Healing particles
	createHeal(x, y, options) {
		return {
			type: 'heal',
			x: x + (Math.random() - 0.5) * 20,
			y: y + Math.random() * 20,
			vx: (Math.random() - 0.5) * 0.3,
			vy: -Math.random() * 1.5 - 0.5,
			size: Math.random() * 3 + 2,
			life: 1,
			maxLife: Math.random() * 1 + 0.8,
			decay: 0.8,
			color: { r: 100, g: 255, b: 150 },
			glow: true,
			glowSize: 6,
			symbol: '+',
		};
	}

	update(dt) {
		// Update emitters
		this.emitters.forEach(emitter => {
			if (!emitter.active) return;
			emitter.timer += dt;
			while (emitter.timer >= 1 / emitter.rate) {
				emitter.timer -= 1 / emitter.rate;
				this.emit(emitter.type, emitter.x, emitter.y, 1, emitter.options);
			}
		});

		// Update particles
		for (let i = this.particles.length - 1; i >= 0; i--) {
			const p = this.particles[i];

			// Decay life
			p.life -= p.decay * dt;

			// Remove dead particles
			if (p.life <= 0) {
				this.particles.splice(i, 1);
				continue;
			}

			// Update based on type
			this.updateParticle(p, dt);
		}
	}

	updateParticle(p, dt) {
		// Apply gravity if present
		if (p.gravity) {
			p.vy += p.gravity;
		}

		// Apply velocity
		p.vx = p.vx || 0;
		p.vy = p.vy || 0;
		p.x += p.vx;
		p.y += p.vy;

		// Type-specific updates
		switch (p.type) {
			case 'soul':
				// Wavy motion
				p.wavePhase += p.waveSpeed * dt;
				p.x += Math.sin(p.wavePhase) * p.waveAmplitude * dt;
				break;

			case 'firefly':
				// Random wandering
				p.wanderAngle += (Math.random() - 0.5) * p.wanderSpeed;
				p.vx += Math.cos(p.wanderAngle) * 0.02;
				p.vy += Math.sin(p.wanderAngle) * 0.02;
				p.vx *= 0.98;
				p.vy *= 0.98;
				p.blinkPhase += p.blinkSpeed * dt;
				break;

			case 'ash':
				// Swaying motion
				p.swayPhase += p.swaySpeed * dt;
				p.x += Math.sin(p.swayPhase) * p.swayAmplitude * dt;
				p.rotation += p.rotationSpeed;
				break;

			case 'magic':
				// Orbit around target
				p.orbitAngle += p.orbitSpeed * dt;
				p.orbitRadius -= 10 * dt;
				p.x = p.targetX + Math.cos(p.orbitAngle) * p.orbitRadius;
				p.y = p.targetY + Math.sin(p.orbitAngle) * p.orbitRadius;
				break;

			case 'spark':
				// Track trail positions
				if (p.trail) {
					p.trail.unshift({ x: p.x, y: p.y });
					if (p.trail.length > p.maxTrail) {
						p.trail.pop();
					}
				}
				break;

			case 'smoke':
				// Grow over time
				p.size += p.growRate * dt;
				break;

			case 'ember':
			case 'dust':
				// Flicker
				p.flickerPhase += p.flickerSpeed * dt;
				break;
		}

		// Wrap rain particles
		if (p.type === 'rain') {
			if (p.y > CANVAS_HEIGHT + 20) {
				p.y = -20;
				p.x = Math.random() * CANVAS_WIDTH;
			}
		}

		// Wrap fireflies and dust
		if (p.type === 'firefly' || p.type === 'dust') {
			if (p.x < -20) p.x = CANVAS_WIDTH + 20;
			if (p.x > CANVAS_WIDTH + 20) p.x = -20;
			if (p.y < -20) p.y = CANVAS_HEIGHT + 20;
			if (p.y > CANVAS_HEIGHT + 20) p.y = -20;
		}
	}

	render() {
		context.save();

		this.particles.forEach(p => {
			const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));

			switch (p.type) {
				case 'rain':
					this.renderRain(p, alpha);
					break;
				case 'spark':
					this.renderSpark(p, alpha);
					break;
				case 'smoke':
					this.renderSmoke(p, alpha);
					break;
				case 'ash':
					this.renderAsh(p, alpha);
					break;
				case 'heal':
					this.renderHeal(p, alpha);
					break;
				default:
					this.renderGlowParticle(p, alpha);
			}
		});

		context.restore();
	}

	renderGlowParticle(p, alpha) {
		const c = p.color;
		let flickerAlpha = alpha;

		// Apply flicker if present
		if (p.flickerPhase !== undefined) {
			flickerAlpha *= 0.7 + Math.sin(p.flickerPhase) * 0.3;
		}

		// Blink for fireflies
		if (p.type === 'firefly' && p.blinkPhase !== undefined) {
			flickerAlpha *= 0.3 + Math.max(0, Math.sin(p.blinkPhase)) * 0.7;
		}

		context.globalAlpha = flickerAlpha;

		// Glow effect
		if (p.glow) {
			const glowSize = p.glowSize || p.size * 3;
			const gradient = context.createRadialGradient(
				p.x, p.y, 0,
				p.x, p.y, glowSize
			);
			gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.8)`);
			gradient.addColorStop(0.4, `rgba(${c.r}, ${c.g}, ${c.b}, 0.3)`);
			gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
			context.fill();
		}

		// Core
		context.fillStyle = `rgba(${Math.min(255, c.r + 50)}, ${Math.min(255, c.g + 50)}, ${Math.min(255, c.b + 50)}, ${flickerAlpha})`;
		context.beginPath();
		context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
		context.fill();
	}

	renderRain(p, alpha) {
		const c = p.color;
		context.globalAlpha = alpha * (c.a || 0.4);
		context.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 1)`;
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(p.x, p.y);
		context.lineTo(p.x + p.vx * 2, p.y + p.length);
		context.stroke();
	}

	renderSpark(p, alpha) {
		const c = p.color;
		context.globalAlpha = alpha;

		// Trail
		if (p.trail && p.trail.length > 0) {
			for (let i = 0; i < p.trail.length; i++) {
				const t = p.trail[i];
				const trailAlpha = alpha * (1 - i / p.trail.length) * 0.5;
				context.globalAlpha = trailAlpha;
				context.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 1)`;
				context.beginPath();
				context.arc(t.x, t.y, p.size * (1 - i / p.trail.length), 0, Math.PI * 2);
				context.fill();
			}
		}

		// Core with glow
		context.globalAlpha = alpha;
		const gradient = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
		gradient.addColorStop(0, `rgba(255, 255, 255, 1)`);
		gradient.addColorStop(0.3, `rgba(${c.r}, ${c.g}, ${c.b}, 0.8)`);
		gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

		context.fillStyle = gradient;
		context.beginPath();
		context.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
		context.fill();
	}

	renderSmoke(p, alpha) {
		const c = p.color;
		context.globalAlpha = alpha * 0.3;

		const gradient = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
		gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.4)`);
		gradient.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, 0.2)`);
		gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

		context.fillStyle = gradient;
		context.beginPath();
		context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
		context.fill();
	}

	renderAsh(p, alpha) {
		const c = p.color;
		context.globalAlpha = alpha * 0.6;
		context.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 1)`;

		context.save();
		context.translate(p.x, p.y);
		context.rotate(p.rotation);

		// Ash flake shape
		context.beginPath();
		context.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
		context.fill();

		context.restore();
	}

	renderHeal(p, alpha) {
		const c = p.color;
		context.globalAlpha = alpha;

		// Glow
		const gradient = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowSize);
		gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.6)`);
		gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(p.x, p.y, p.glowSize, 0, Math.PI * 2);
		context.fill();

		// Plus symbol
		context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
		context.font = `${p.size * 4}px Dungeon`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText('+', p.x, p.y);
	}

	/**
	 * Burst effect - emit many particles at once
	 */
	burst(type, x, y, count, options = {}) {
		this.emit(type, x, y, count, options);
	}

	/**
	 * Clear all particles
	 */
	clear() {
		this.particles = [];
	}

	/**
	 * Get particle count
	 */
	get count() {
		return this.particles.length;
	}
}
