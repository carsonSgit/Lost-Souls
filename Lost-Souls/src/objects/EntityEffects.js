import { CANVAS_HEIGHT, CANVAS_WIDTH, context } from "../globals.js";

/**
 * EntityEffects - Visual effects system for entities, combat, and interactions
 * Handles attack trails, impacts, hit flashes, death explosions, and more
 */
export default class EntityEffects {
	constructor() {
		// Slash trail effects
		this.slashTrails = [];

		// Impact sparks
		this.sparks = [];

		// Blood splatter
		this.bloodParticles = [];

		// Hit flash overlays (white flash on damage)
		this.hitFlashes = [];

		// Death explosions
		this.deathExplosions = [];

		// Boss entrance effects
		this.bossEntrance = null;

		// Door portal effects
		this.doorEffects = [];

		// Spawn effects
		this.spawnEffects = [];

		// Afterimages for dashing/fast movement
		this.afterimages = [];

		// Ground impact waves
		this.impactWaves = [];

		// Floating indicators
		this.indicators = [];
	}

	clear() {
		this.slashTrails = [];
		this.sparks = [];
		this.bloodParticles = [];
		this.hitFlashes = [];
		this.deathExplosions = [];
		this.bossEntrance = null;
		this.doorEffects = [];
		this.spawnEffects = [];
		this.afterimages = [];
		this.impactWaves = [];
		this.indicators = [];
	}

	// ==================== SLASH TRAILS ====================

	/**
	 * Helper function to generate a random shard shape (simplified for performance)
	 */
	generateShardShape() {
		const shardType = Math.random();
		
		if (shardType < 0.4) {
			// Sharp triangle shard (3 points - fastest)
			return [
				{ x: 0, y: -1 },
				{ x: 0.6, y: 0.8 },
				{ x: -0.4, y: 0.5 }
			];
		} else if (shardType < 0.7) {
			// Irregular diamond (4 points)
			return [
				{ x: 0, y: -1 },
				{ x: 0.7, y: 0 },
				{ x: 0.2, y: 1 },
				{ x: -0.5, y: 0.2 }
			];
		} else {
			// Pentagon shard (5 points - simpler than before)
			return [
				{ x: 0, y: -1 },
				{ x: 0.8, y: -0.3 },
				{ x: 0.5, y: 0.8 },
				{ x: -0.5, y: 0.6 },
				{ x: -0.7, y: -0.2 }
			];
		}
	}

	/**
	 * Create a sword slash trail effect
	 * @param {number} x - Center X position
	 * @param {number} y - Center Y position
	 * @param {string} direction - 'left' or 'right'
	 * @param {object} options - Color, size options
	 */
	createSlashTrail(x, y, direction, options = {}) {
		const {
			color = { r: 255, g: 255, b: 255 },
			size = 40,
			duration = 0.25,
			type = 'horizontal' // horizontal, vertical, diagonal
		} = options;

		// Calculate arc based on direction and type
		let startAngle, endAngle;

		if (type === 'horizontal') {
			if (direction === 'right') {
				startAngle = -Math.PI * 0.6;
				endAngle = Math.PI * 0.6;
			} else {
				startAngle = Math.PI * 0.4;
				endAngle = Math.PI * 1.6;
			}
		} else if (type === 'vertical') {
			startAngle = -Math.PI * 0.8;
			endAngle = Math.PI * 0.2;
		} else {
			// Diagonal
			startAngle = direction === 'right' ? -Math.PI * 0.7 : Math.PI * 0.3;
			endAngle = startAngle + Math.PI * 0.8;
		}

		this.slashTrails.push({
			x,
			y,
			startAngle,
			endAngle,
			currentAngle: startAngle,
			size,
			color,
			alpha: 1,
			duration,
			timer: 0,
			points: [], // Trail points for rendering
		});
	}

	/**
	 * Create player sword swing arc
	 */
	createPlayerSlash(x, y, direction) {
		this.createSlashTrail(x, y, direction, {
			color: { r: 200, g: 220, b: 255 },
			size: 45,
			duration: 0.2,
		});

		// Add some sparks at the tip
		for (let i = 0; i < 3; i++) {
			const angle = direction === 'right' ? Math.random() * Math.PI - Math.PI/2 : Math.PI/2 + Math.random() * Math.PI;
			this.createSpark(x + Math.cos(angle) * 30, y + Math.sin(angle) * 20, {
				color: { r: 200, g: 220, b: 255 },
			});
		}
	}

	/**
	 * Create enemy attack slash (red-tinted)
	 */
	createEnemySlash(x, y, direction, enemyType = 'skeleton') {
		let color;
		switch (enemyType) {
			case 'boss':
				color = { r: 255, g: 100, b: 50 };
				break;
			case 'eye':
				color = { r: 180, g: 50, b: 200 };
				break;
			default:
				color = { r: 255, g: 150, b: 150 };
		}

		this.createSlashTrail(x, y, direction, {
			color,
			size: enemyType === 'boss' ? 50 : 35, // Reduced from 60 to 50 for better performance
			duration: 0.25,
		});
	}

	// ==================== IMPACT EFFECTS ====================

	/**
	 * Create spark particles on impact
	 */
	createSpark(x, y, options = {}) {
		const {
			count = 5,
			color = { r: 255, g: 200, b: 100 },
			speed = 3,
		} = options;

		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const velocity = (Math.random() * 0.5 + 0.5) * speed;

			this.sparks.push({
				x,
				y,
				vx: Math.cos(angle) * velocity,
				vy: Math.sin(angle) * velocity,
				size: Math.random() * 3 + 2,
				color,
				alpha: 1,
				life: Math.random() * 0.3 + 0.2,
				timer: 0,
				hasTrail: Math.random() > 0.5,
				trail: [],
				rotation: Math.random() * Math.PI * 2,
				rotationSpeed: (Math.random() - 0.5) * 0.3,
				shardShape: this.generateShardShape(),
			});
		}
	}

	/**
	 * Create impact burst when attack connects
	 */
	createHitImpact(x, y, direction, isCritical = false) {
		// Sparks
		const sparkCount = isCritical ? 12 : 6;
		const sparkColor = isCritical
			? { r: 255, g: 255, b: 100 }
			: { r: 255, g: 200, b: 150 };

		this.createSpark(x, y, { count: sparkCount, color: sparkColor, speed: isCritical ? 5 : 3 });

		// Impact wave
		this.impactWaves.push({
			x,
			y,
			radius: 5,
			maxRadius: isCritical ? 50 : 30,
			alpha: isCritical ? 1 : 0.7,
			color: sparkColor,
			timer: 0,
			duration: 0.2,
		});

		// Directional burst
		const burstX = direction === 'right' ? 1 : -1;
		for (let i = 0; i < 3; i++) {
			this.sparks.push({
				x,
				y,
				vx: burstX * (Math.random() * 3 + 2),
				vy: (Math.random() - 0.5) * 2,
				size: Math.random() * 2 + 2,
				color: { r: 255, g: 255, b: 255 },
				alpha: 1,
				life: 0.15,
				timer: 0,
				hasTrail: true,
				trail: [],
				rotation: Math.random() * Math.PI * 2,
				rotationSpeed: (Math.random() - 0.5) * 0.3,
				shardShape: this.generateShardShape(),
			});
		}
	}

	// ==================== BLOOD EFFECTS ====================

	/**
	 * Create blood splatter on damage
	 */
	createBloodSplatter(x, y, direction, amount = 1) {
		const particleCount = Math.floor(8 * amount);
		const dirMult = direction === 'right' ? 1 : -1;

		for (let i = 0; i < particleCount; i++) {
			const angle = (Math.random() - 0.5) * Math.PI * 0.8 + (direction === 'right' ? 0 : Math.PI);
			const speed = Math.random() * 4 + 2;

			this.bloodParticles.push({
				x,
				y,
				vx: Math.cos(angle) * speed * 0.8 + dirMult * 1,
				vy: Math.sin(angle) * speed - 2,
				gravity: 8,
				size: Math.random() * 4 + 2,
				alpha: 1,
				life: Math.random() * 0.5 + 0.3,
				timer: 0,
				color: {
					r: 120 + Math.random() * 40,
					g: 10 + Math.random() * 20,
					b: 10 + Math.random() * 20,
				},
			});
		}

		// Blood drops that fall
		for (let i = 0; i < 3; i++) {
			this.bloodParticles.push({
				x: x + (Math.random() - 0.5) * 20,
				y: y + Math.random() * 10,
				vx: dirMult * Math.random() * 2,
				vy: Math.random() * -1,
				gravity: 6,
				size: Math.random() * 3 + 2,
				alpha: 0.9,
				life: 0.8,
				timer: 0,
				color: { r: 100, g: 15, b: 15 },
				isDrop: true,
			});
		}
	}

	// ==================== HIT FLASH ====================

	/**
	 * Register an entity for hit flash effect
	 */
	createHitFlash(entity, duration = 0.1, color = { r: 255, g: 255, b: 255 }) {
		this.hitFlashes.push({
			entity,
			duration,
			timer: 0,
			color,
			intensity: 1,
		});
	}

	/**
	 * Check if entity should be rendered with flash
	 */
	getHitFlashAlpha(entity) {
		const flash = this.hitFlashes.find(f => f.entity === entity);
		if (flash) {
			return flash.intensity * (1 - flash.timer / flash.duration);
		}
		return 0;
	}

	// ==================== DEATH EXPLOSIONS ====================

	/**
	 * Create death explosion for enemy
	 */
	createDeathExplosion(x, y, enemyType = 'skeleton') {
		let color, size, particleCount;

		switch (enemyType) {
			case 'boss':
				color = { r: 255, g: 100, b: 50 };
				size = 80;
				particleCount = 30;
				break;
			case 'eye':
				color = { r: 150, g: 50, b: 200 };
				size = 40;
				particleCount = 15;
				break;
			default:
				color = { r: 200, g: 180, b: 150 };
				size = 50;
				particleCount = 20;
		}

		// Main explosion
		this.deathExplosions.push({
			x,
			y,
			radius: 5,
			maxRadius: size,
			alpha: 1,
			color,
			timer: 0,
			duration: 0.4,
			rings: [],
		});

		// Expanding rings
		for (let i = 0; i < 3; i++) {
			setTimeout(() => {
				this.impactWaves.push({
					x,
					y,
					radius: 10 + i * 10,
					maxRadius: size + i * 20,
					alpha: 0.6 - i * 0.15,
					color,
					timer: 0,
					duration: 0.3 + i * 0.1,
				});
			}, i * 50);
		}

		// Explosion particles
		for (let i = 0; i < particleCount; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * 5 + 3;

			this.sparks.push({
				x,
				y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed - 2,
				size: Math.random() * 4 + 2,
				color,
				alpha: 1,
				life: Math.random() * 0.5 + 0.3,
				timer: 0,
				hasTrail: true,
				trail: [],
				rotation: Math.random() * Math.PI * 2,
				rotationSpeed: (Math.random() - 0.5) * 0.3,
				shardShape: this.generateShardShape(),
			});
		}

		// Soul release effect
		for (let i = 0; i < 5; i++) {
			const angle = Math.random() * Math.PI * 2;
			this.sparks.push({
				x,
				y,
				vx: Math.cos(angle) * 1,
				vy: -Math.random() * 2 - 1,
				size: Math.random() * 3 + 2,
				color: { r: 180, g: 200, b: 255 },
				alpha: 0.8,
				life: 1,
				timer: 0,
				hasTrail: false,
				trail: [],
				isSoul: true,
			});
		}
	}

	// ==================== BOSS ENTRANCE ====================

	/**
	 * Start boss entrance cinematic effect
	 */
	startBossEntrance(x, y, callback = null) {
		this.bossEntrance = {
			x,
			y,
			phase: 0, // 0: buildup, 1: reveal, 2: shockwave
			timer: 0,
			duration: 2.5,
			callback,
			rings: [],
			particles: [],
			groundCracks: [],
			screenShake: 0,
		};

		// Generate ground cracks pattern
		for (let i = 0; i < 8; i++) {
			const angle = (i / 8) * Math.PI * 2;
			this.bossEntrance.groundCracks.push({
				angle,
				length: 0,
				maxLength: 60 + Math.random() * 40,
				branches: [],
			});
		}
	}

	updateBossEntrance(dt) {
		if (!this.bossEntrance) return null;

		const be = this.bossEntrance;
		be.timer += dt;
		const progress = be.timer / be.duration;

		// Phase transitions
		if (progress < 0.4) {
			be.phase = 0; // Buildup
			be.screenShake = Math.sin(be.timer * 20) * 2 * progress;

			// Growing darkness
			if (Math.random() < dt * 10) {
				const angle = Math.random() * Math.PI * 2;
				be.particles.push({
					x: be.x + Math.cos(angle) * 100,
					y: be.y + Math.sin(angle) * 100,
					targetX: be.x,
					targetY: be.y,
					size: Math.random() * 5 + 2,
					alpha: 0.8,
				});
			}

			// Extend ground cracks
			be.groundCracks.forEach(crack => {
				if (crack.length < crack.maxLength * progress * 2) {
					crack.length += dt * 100;
				}
			});
		} else if (progress < 0.6) {
			be.phase = 1; // Reveal
			be.screenShake = 8;

			// Explosion particles
			if (be.rings.length === 0) {
				for (let i = 0; i < 3; i++) {
					be.rings.push({
						radius: 0,
						maxRadius: 150 + i * 50,
						alpha: 1 - i * 0.2,
						timer: 0,
					});
				}
			}
		} else {
			be.phase = 2; // Shockwave
			be.screenShake = Math.max(0, 8 * (1 - (progress - 0.6) / 0.4));
		}

		// Update rings
		be.rings.forEach(ring => {
			ring.timer += dt;
			ring.radius = ring.maxRadius * Math.min(1, ring.timer * 3);
			ring.alpha = Math.max(0, ring.alpha - dt * 2);
		});

		// Update particles
		be.particles.forEach(p => {
			const dx = p.targetX - p.x;
			const dy = p.targetY - p.y;
			p.x += dx * dt * 3;
			p.y += dy * dt * 3;
			p.alpha -= dt * 0.5;
		});
		be.particles = be.particles.filter(p => p.alpha > 0);

		// Complete
		if (progress >= 1) {
			if (be.callback) be.callback();
			this.bossEntrance = null;
		}

		return be.screenShake;
	}

	// ==================== DOOR PORTAL EFFECTS ====================

	/**
	 * Create door activation/portal effect
	 */
	createDoorPortal(x, y, width, height) {
		this.doorEffects.push({
			x,
			y,
			width,
			height,
			timer: 0,
			active: true,
			particles: [],
			pulsePhase: 0,
		});

		// Initial burst
		for (let i = 0; i < 20; i++) {
			const angle = Math.random() * Math.PI * 2;
			this.sparks.push({
				x: x + width/2,
				y: y + height/2,
				vx: Math.cos(angle) * 3,
				vy: Math.sin(angle) * 3,
				size: Math.random() * 3 + 1,
				color: { r: 100, g: 200, b: 255 },
				alpha: 1,
				life: 0.5,
				timer: 0,
				hasTrail: true,
				trail: [],
				rotation: Math.random() * Math.PI * 2,
				rotationSpeed: (Math.random() - 0.5) * 0.3,
				shardShape: this.generateShardShape(),
			});
		}
	}

	/**
	 * Deactivate door effect
	 */
	removeDoorPortal(x, y) {
		this.doorEffects = this.doorEffects.filter(
			d => Math.abs(d.x - x) > 10 || Math.abs(d.y - y) > 10
		);
	}

	// ==================== SPAWN EFFECTS ====================

	/**
	 * Create enemy spawn effect
	 */
	createSpawnEffect(x, y, enemyType = 'skeleton') {
		let color;
		switch (enemyType) {
			case 'boss':
				color = { r: 255, g: 100, b: 50 };
				break;
			case 'eye':
				color = { r: 150, g: 50, b: 200 };
				break;
			default:
				color = { r: 100, g: 150, b: 100 };
		}

		this.spawnEffects.push({
			x,
			y,
			timer: 0,
			duration: 0.5,
			color,
			rings: [],
		});

		// Rising particles
		for (let i = 0; i < 10; i++) {
			this.sparks.push({
				x: x + (Math.random() - 0.5) * 30,
				y: y + 20,
				vx: (Math.random() - 0.5) * 2,
				vy: -Math.random() * 3 - 1,
				size: Math.random() * 3 + 1,
				color,
				alpha: 0.8,
				life: 0.6,
				timer: 0,
				hasTrail: false,
				trail: [],
				rotation: Math.random() * Math.PI * 2,
				rotationSpeed: (Math.random() - 0.5) * 0.3,
				shardShape: this.generateShardShape(),
			});
		}

		// Ground ring
		this.impactWaves.push({
			x,
			y: y + 20,
			radius: 5,
			maxRadius: 40,
			alpha: 0.6,
			color,
			timer: 0,
			duration: 0.4,
		});
	}

	// ==================== AFTERIMAGES ====================

	/**
	 * Create afterimage for fast movement
	 */
	createAfterimage(entity, alpha = 0.5) {
		if (!entity || !entity.sprites) return;

		this.afterimages.push({
			x: entity.position.x,
			y: entity.position.y,
			width: entity.dimensions.x,
			height: entity.dimensions.y,
			sprite: entity.sprites[entity.currentAnimation.frames[entity.currentAnimation.currentFrame]],
			direction: entity.direction,
			alpha,
			timer: 0,
			duration: 0.2,
			tint: { r: 100, g: 150, b: 255 },
		});
	}

	// ==================== INDICATORS ====================

	/**
	 * Create floating indicator (!, ?, etc)
	 */
	createIndicator(x, y, symbol, color = { r: 255, g: 255, b: 100 }) {
		this.indicators.push({
			x,
			y,
			symbol,
			color,
			timer: 0,
			duration: 1,
			bouncePhase: 0,
		});
	}

	// ==================== UPDATE ====================

	update(dt) {
		// Update slash trails
		this.slashTrails.forEach(trail => {
			trail.timer += dt;
			const progress = trail.timer / trail.duration;

			// Animate the arc
			trail.currentAngle = trail.startAngle + (trail.endAngle - trail.startAngle) * Math.min(1, progress * 2);
			trail.alpha = 1 - progress;

			// Add points to trail
			if (progress < 0.5) {
				trail.points.push({
					angle: trail.currentAngle,
					alpha: trail.alpha,
				});
			}
		});
		this.slashTrails = this.slashTrails.filter(t => t.timer < t.duration);

		// Update sparks
		this.sparks.forEach(spark => {
			spark.timer += dt;

			// Store trail position
			if (spark.hasTrail && spark.trail && spark.trail.length < 10) {
				spark.trail.push({ x: spark.x, y: spark.y, alpha: spark.alpha });
			}

			spark.x += spark.vx;
			spark.y += spark.vy;

			// Soul particles float up
			if (spark.isSoul) {
				spark.x += Math.sin(spark.timer * 5) * 0.5;
			} else {
				spark.vy += 0.2; // Gravity
				// Rotate shard fragments
				if (spark.rotation !== undefined) {
					spark.rotation += spark.rotationSpeed;
				}
			}

			spark.alpha = 1 - spark.timer / spark.life;

			// Fade trail
			if (spark.trail) {
				spark.trail.forEach(t => t.alpha *= 0.9);
			}
		});
		this.sparks = this.sparks.filter(s => s.timer < s.life);

		// Update blood particles
		this.bloodParticles.forEach(blood => {
			blood.timer += dt;
			blood.x += blood.vx;
			blood.y += blood.vy;
			blood.vy += blood.gravity * dt;
			blood.vx *= 0.98;
			blood.alpha = 1 - blood.timer / blood.life;
		});
		this.bloodParticles = this.bloodParticles.filter(b => b.timer < b.life);

		// Update hit flashes
		this.hitFlashes.forEach(flash => {
			flash.timer += dt;
		});
		this.hitFlashes = this.hitFlashes.filter(f => f.timer < f.duration);

		// Update death explosions
		this.deathExplosions.forEach(exp => {
			exp.timer += dt;
			const progress = exp.timer / exp.duration;
			exp.radius = exp.maxRadius * progress;
			exp.alpha = 1 - progress;
		});
		this.deathExplosions = this.deathExplosions.filter(e => e.timer < e.duration);

		// Update impact waves
		this.impactWaves.forEach(wave => {
			wave.timer += dt;
			const progress = wave.timer / wave.duration;
			wave.radius = wave.maxRadius * progress;
			wave.alpha = wave.alpha * (1 - progress);
		});
		this.impactWaves = this.impactWaves.filter(w => w.timer < w.duration);

		// Update door effects
		this.doorEffects.forEach(door => {
			door.timer += dt;
			door.pulsePhase += dt * 3;

			// Emit particles
			if (Math.random() < dt * 5) {
				const edge = Math.floor(Math.random() * 4);
				let px, py;
				switch (edge) {
					case 0: px = door.x + Math.random() * door.width; py = door.y; break;
					case 1: px = door.x + Math.random() * door.width; py = door.y + door.height; break;
					case 2: px = door.x; py = door.y + Math.random() * door.height; break;
					case 3: px = door.x + door.width; py = door.y + Math.random() * door.height; break;
				}
				door.particles.push({
					x: px,
					y: py,
					vx: (Math.random() - 0.5) * 0.5,
					vy: -Math.random() * 1 - 0.5,
					alpha: 0.8,
					size: Math.random() * 2 + 1,
				});
			}

			// Update door particles
			door.particles.forEach(p => {
				p.x += p.vx;
				p.y += p.vy;
				p.alpha -= dt * 2;
			});
			door.particles = door.particles.filter(p => p.alpha > 0);
		});

		// Update spawn effects
		this.spawnEffects.forEach(spawn => {
			spawn.timer += dt;
		});
		this.spawnEffects = this.spawnEffects.filter(s => s.timer < s.duration);

		// Update afterimages
		this.afterimages.forEach(img => {
			img.timer += dt;
			img.alpha = img.alpha * (1 - img.timer / img.duration);
		});
		this.afterimages = this.afterimages.filter(i => i.timer < i.duration);

		// Update indicators
		this.indicators.forEach(ind => {
			ind.timer += dt;
			ind.bouncePhase += dt * 8;
		});
		this.indicators = this.indicators.filter(i => i.timer < i.duration);

		// Update boss entrance
		return this.updateBossEntrance(dt);
	}

	// ==================== RENDER ====================

	render() {
		context.save();

		// Render afterimages (behind everything)
		this.renderAfterimages();

		// Render spawn effects
		this.renderSpawnEffects();

		// Render door effects
		this.renderDoorEffects();

		// Render slash trails
		this.renderSlashTrails();

		// Render impact waves
		this.renderImpactWaves();

		// Render sparks
		this.renderSparks();

		// Render blood
		this.renderBlood();

		// Render death explosions
		this.renderDeathExplosions();

		// Render boss entrance
		this.renderBossEntrance();

		// Render indicators
		this.renderIndicators();

		context.restore();
	}

	renderSlashTrails() {
		this.slashTrails.forEach(trail => {
			context.save();
			context.translate(trail.x, trail.y);

			// Outer energy trail
			context.strokeStyle = `rgba(${trail.color.r}, ${trail.color.g}, ${trail.color.b}, ${trail.alpha * 0.7})`;
			context.lineWidth = 6;
			context.lineCap = 'round';
			context.shadowBlur = 15;
			context.shadowColor = `rgba(${trail.color.r}, ${trail.color.g}, ${trail.color.b}, ${trail.alpha})`;

			context.beginPath();
			context.arc(0, 0, trail.size, trail.startAngle, trail.currentAngle);
			context.stroke();

			// Inner bright core line
			context.strokeStyle = `rgba(255, 255, 255, ${trail.alpha * 0.8})`;
			context.lineWidth = 2;
			context.shadowBlur = 8;
			context.beginPath();
			context.arc(0, 0, trail.size, trail.startAngle, trail.currentAngle);
			context.stroke();

			context.restore();
		});
	}

	renderSparks() {
		this.sparks.forEach(spark => {
			// Draw trail first
			if (spark.hasTrail && spark.trail && spark.trail.length > 1) {
				context.beginPath();
				context.moveTo(spark.trail[0].x, spark.trail[0].y);
				for (let i = 1; i < spark.trail.length; i++) {
					context.lineTo(spark.trail[i].x, spark.trail[i].y);
				}
				context.strokeStyle = `rgba(${spark.color.r}, ${spark.color.g}, ${spark.color.b}, ${spark.alpha * 0.3})`;
				context.lineWidth = spark.size * 0.5;
				context.stroke();
			}

			context.globalAlpha = spark.alpha;
			context.shadowBlur = spark.isSoul ? 10 : 5;
			context.shadowColor = `rgb(${spark.color.r}, ${spark.color.g}, ${spark.color.b})`;

			if (spark.isSoul) {
				// Souls: Simplified ethereal wisp shape   
				const gradient = context.createRadialGradient(
					spark.x, spark.y, 0,
					spark.x, spark.y, spark.size * 2
				);
				gradient.addColorStop(0, `rgba(${spark.color.r}, ${spark.color.g}, ${spark.color.b}, ${spark.alpha})`);
				gradient.addColorStop(0.5, `rgba(${spark.color.r}, ${spark.color.g}, ${spark.color.b}, ${spark.alpha * 0.5})`);
				gradient.addColorStop(1, `rgba(${spark.color.r}, ${spark.color.g}, ${spark.color.b}, 0)`);
				context.fillStyle = gradient;
				context.beginPath();
				context.ellipse(spark.x, spark.y, spark.size * 2, spark.size * 1.5, spark.timer, 0, Math.PI * 2);
				context.fill();
			} else if (spark.shardShape) {
				// Combat sparks: Irregular shard/fragment shapes
				context.save();
				context.translate(spark.x, spark.y);
				context.rotate(spark.rotation);
				context.scale(spark.size, spark.size);
				
				// Draw shard shape
				context.fillStyle = `rgb(${spark.color.r}, ${spark.color.g}, ${spark.color.b})`;
				context.beginPath();
				spark.shardShape.forEach((point, i) => {
					if (i === 0) {
						context.moveTo(point.x, point.y);
					} else {
						context.lineTo(point.x, point.y);
					}
				});
				context.closePath();
				context.fill();
				
				// Bright edge highlight (simplified)
				context.strokeStyle = `rgba(255, 255, 255, ${spark.alpha * 0.5})`;
				context.lineWidth = 0.2;
				context.stroke();
				
				context.restore();
			}
			
			context.shadowBlur = 0;
		});
		context.globalAlpha = 1;
	}

	renderBlood() {
		this.bloodParticles.forEach(blood => {
			context.globalAlpha = blood.alpha;
			context.fillStyle = `rgb(${blood.color.r}, ${blood.color.g}, ${blood.color.b})`;

			context.save();
			context.translate(blood.x, blood.y);
			
			if (blood.isDrop) {
				// Simplified elongated drop shape
				const angle = Math.atan2(blood.vy, blood.vx);
				context.rotate(angle);
				context.beginPath();
				context.ellipse(0, 0, blood.size * 0.6, blood.size * 1.2, 0, 0, Math.PI * 2);
				context.fill();
			} else {
				// Simplified irregular splatter shape
				if (!blood.shape) {
					// Generate random splatter shape once (reduced points)
					blood.shape = [];
					const points = 5; // Fixed at 5 points for performance
					for (let i = 0; i < points; i++) {
						const angle = (i / points) * Math.PI * 2;
						const radiusVariation = 0.7 + Math.random() * 0.6;
						blood.shape.push({
							angle,
							radius: blood.size * radiusVariation
						});
					}
				}
				
				// Draw irregular splatter
				context.beginPath();
				blood.shape.forEach((point, i) => {
					const x = Math.cos(point.angle) * point.radius;
					const y = Math.sin(point.angle) * point.radius;
					if (i === 0) {
						context.moveTo(x, y);
					} else {
						context.lineTo(x, y);
					}
				});
				context.closePath();
				context.fill();
			}
			
			context.restore();
		});
		context.globalAlpha = 1;
	}

	renderImpactWaves() {
		this.impactWaves.forEach(wave => {
			context.globalAlpha = wave.alpha;
			context.strokeStyle = `rgb(${wave.color.r}, ${wave.color.g}, ${wave.color.b})`;
			context.lineWidth = 2;
			context.shadowBlur = 8;
			context.shadowColor = `rgb(${wave.color.r}, ${wave.color.g}, ${wave.color.b})`;
			
			context.save();
			context.translate(wave.x, wave.y);
			
			// Generate simpler crack pattern if not exists
			if (!wave.cracks) {
				wave.cracks = [];
				const crackCount = 6; // Fixed count for performance
				for (let i = 0; i < crackCount; i++) {
					const angle = (i / crackCount) * Math.PI * 2;
					wave.cracks.push({ angle });
				}
			}
			
			// Draw main cracks radiating outward
			context.beginPath();
			wave.cracks.forEach(crack => {
				const length = wave.radius;
				const endX = Math.cos(crack.angle) * length;
				const endY = Math.sin(crack.angle) * length;
				context.moveTo(0, 0);
				context.lineTo(endX, endY);
			});
			context.stroke();
			
			context.restore();
			context.shadowBlur = 0;
		});
		context.globalAlpha = 1;
	}

	renderDeathExplosions() {
		this.deathExplosions.forEach(exp => {
			context.save();
			context.translate(exp.x, exp.y);
			
			// Simplified dark energy burst
			const tendrils = 6; // Reduced from 8
			const progress = exp.timer / exp.duration;
			
			context.strokeStyle = `rgba(${exp.color.r}, ${exp.color.g}, ${exp.color.b}, ${exp.alpha * 0.8})`;
			context.lineWidth = 4;
			context.shadowBlur = 12;
			context.shadowColor = `rgba(${exp.color.r}, ${exp.color.g}, ${exp.color.b}, ${exp.alpha})`;
			
			// Draw simplified tendrils
			context.beginPath();
			for (let i = 0; i < tendrils; i++) {
				const angle = (i / tendrils) * Math.PI * 2;
				const length = exp.radius;
				const endX = Math.cos(angle) * length;
				const endY = Math.sin(angle) * length;
				context.moveTo(0, 0);
				context.lineTo(endX, endY);
			}
			context.stroke();
			
			// Simplified burst core
			context.shadowBlur = 15;
			context.shadowColor = `rgba(255, 255, 255, ${exp.alpha})`;
			
			// Simple star burst shape for core (5 points instead of 6)
			const corePoints = 5;
			context.fillStyle = `rgba(255, 255, 255, ${exp.alpha})`;
			context.beginPath();
			for (let i = 0; i <= corePoints * 2; i++) {
				const angle = (i / (corePoints * 2)) * Math.PI * 2;
				const radius = (i % 2 === 0) ? exp.radius * 0.25 : exp.radius * 0.1;
				const x = Math.cos(angle) * radius;
				const y = Math.sin(angle) * radius;
				if (i === 0) {
					context.moveTo(x, y);
				} else {
					context.lineTo(x, y);
				}
			}
			context.closePath();
			context.fill();
			
			context.restore();
			context.shadowBlur = 0;
		});
	}

	renderBossEntrance() {
		if (!this.bossEntrance) return;

		const be = this.bossEntrance;

		// Dark overlay during buildup
		if (be.phase === 0) {
			const darkness = Math.min(0.7, be.timer * 0.5);
			context.fillStyle = `rgba(0, 0, 0, ${darkness})`;
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		}

		// Ground cracks
		context.strokeStyle = 'rgba(255, 100, 50, 0.8)';
		context.lineWidth = 2;
		context.shadowBlur = 10;
		context.shadowColor = 'rgba(255, 100, 50, 1)';

		be.groundCracks.forEach(crack => {
			if (crack.length > 0) {
				context.beginPath();
				context.moveTo(be.x, be.y);
				context.lineTo(
					be.x + Math.cos(crack.angle) * crack.length,
					be.y + Math.sin(crack.angle) * crack.length
				);
				context.stroke();
			}
		});
		context.shadowBlur = 0;

		// Converging dark energy particles - simplified
		be.particles.forEach(p => {
			context.globalAlpha = p.alpha;
			context.shadowBlur = 10;
			context.shadowColor = 'rgba(100, 50, 150, 0.8)';
			
			context.save();
			context.translate(p.x, p.y);
			const angle = Math.atan2(p.targetY - p.y, p.targetX - p.x);
			context.rotate(angle);
			
			// Simplified dark energy blob
			context.fillStyle = 'rgba(100, 50, 150, 0.9)';
			context.beginPath();
			context.ellipse(0, 0, p.size * 3, p.size * 1.5, 0, 0, Math.PI * 2);
			context.fill();
			
			context.restore();
			context.shadowBlur = 0;
		});

		// Simplified reveal rings
		be.rings.forEach(ring => {
			context.globalAlpha = ring.alpha;
			context.strokeStyle = 'rgba(255, 100, 50, 1)';
			context.lineWidth = 4;
			context.shadowBlur = 15;
			context.shadowColor = 'rgba(255, 100, 50, 1)';
			
			context.save();
			context.translate(be.x, be.y);
			
			// Simple burst pattern (8 spikes instead of 12)
			context.beginPath();
			const spikes = 8;
			for (let i = 0; i <= spikes; i++) {
				const angle = (i / spikes) * Math.PI * 2;
				const radiusMultiplier = (i % 2 === 0) ? 1 : 0.7;
				const radius = ring.radius * radiusMultiplier;
				const x = Math.cos(angle) * radius;
				const y = Math.sin(angle) * radius;
				
				if (i === 0) {
					context.moveTo(x, y);
				} else {
					context.lineTo(x, y);
				}
			}
			context.closePath();
			context.stroke();
			
			context.restore();
			context.shadowBlur = 0;
		});

		context.globalAlpha = 1;
	}

	renderDoorEffects() {
		this.doorEffects.forEach(door => {
			const pulse = 0.5 + Math.sin(door.pulsePhase) * 0.3;

			// Portal glow (subtle atmospheric effect, tight to door)
			const gradient = context.createRadialGradient(
				door.x + door.width/2, door.y + door.height/2, 0,
				door.x + door.width/2, door.y + door.height/2, Math.max(door.width, door.height) * 0.6
			);
			gradient.addColorStop(0, `rgba(100, 200, 255, ${pulse * 0.25})`);
			gradient.addColorStop(0.5, `rgba(50, 150, 255, ${pulse * 0.12})`);
			gradient.addColorStop(1, 'rgba(0, 100, 200, 0)');

			context.fillStyle = gradient;
			context.fillRect(
				door.x, door.y,
				door.width, door.height
			);

			// Border glow - matches door sprite exactly (64x80)
			// Use lineWidth of 2, and draw border to match sprite bounds precisely
			const lineWidth = 2;
			context.strokeStyle = `rgba(100, 200, 255, ${pulse})`;
			context.lineWidth = lineWidth;
			context.shadowBlur = 10;
			context.shadowColor = 'rgba(100, 200, 255, 0.6)';
			// Draw border at exact sprite position and size (64x80)
			// strokeRect draws from center of line, so we offset by half lineWidth
			context.strokeRect(
				door.x + lineWidth / 2, 
				door.y + lineWidth / 2, 
				door.width - Image.TileSize, 
				door.height - Image.TileSize
			);
			context.shadowBlur = 0;

			// Simplified mystical particles
			door.particles.forEach(p => {
				context.globalAlpha = p.alpha;
				context.shadowBlur = 6;
				context.shadowColor = 'rgba(150, 220, 255, 0.8)';
				
				// Simple diamond shape
				context.fillStyle = 'rgba(150, 220, 255, 0.8)';
				context.beginPath();
				context.moveTo(p.x, p.y - p.size * 2);
				context.lineTo(p.x + p.size * 1.5, p.y);
				context.lineTo(p.x, p.y + p.size * 2);
				context.lineTo(p.x - p.size * 1.5, p.y);
				context.closePath();
				context.fill();
				
				context.shadowBlur = 0;
			});
			context.globalAlpha = 1;
		});
	}

	renderSpawnEffects() {
		this.spawnEffects.forEach(spawn => {
			const progress = spawn.timer / spawn.duration;
			const alpha = 1 - progress;

			context.save();
			context.translate(spawn.x, spawn.y);
			context.globalAlpha = alpha;
			context.shadowBlur = 12;
			context.shadowColor = `rgba(${spawn.color.r}, ${spawn.color.g}, ${spawn.color.b}, ${alpha})`;
			
			// Simplified rising energy pillars
			context.fillStyle = `rgba(${spawn.color.r}, ${spawn.color.g}, ${spawn.color.b}, ${alpha * 0.6})`;
			
			// Draw two simple rectangles instead of jagged pillars
			context.fillRect(-15, -50, 10, 80);
			context.fillRect(5, -50, 10, 80);
			
			// Add bright center streak
			context.fillStyle = `rgba(${Math.min(255, spawn.color.r + 100)}, ${Math.min(255, spawn.color.g + 100)}, ${Math.min(255, spawn.color.b + 100)}, ${alpha * 0.8})`;
			context.fillRect(-2, -50, 4, 80);
			
			context.restore();
			context.shadowBlur = 0;
		});
	}

	renderAfterimages() {
		this.afterimages.forEach(img => {
			context.globalAlpha = img.alpha;

			// Tinted overlay
			context.fillStyle = `rgba(${img.tint.r}, ${img.tint.g}, ${img.tint.b}, ${img.alpha * 0.3})`;

			context.save();
			if (img.direction === 'left') {
				context.scale(-1, 1);
				context.translate(-img.x * 2 - img.width, 0);
			}

			// Draw sprite silhouette if available
			if (img.sprite) {
				img.sprite.render(img.x, img.y);
			}

			context.restore();
		});
		context.globalAlpha = 1;
	}

	renderIndicators() {
		this.indicators.forEach(ind => {
			const bounce = Math.sin(ind.bouncePhase) * 5;
			const alpha = 1 - ind.timer / ind.duration;

			context.globalAlpha = alpha;
			context.font = '20px Dungeon';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.shadowBlur = 10;
			context.shadowColor = `rgba(${ind.color.r}, ${ind.color.g}, ${ind.color.b}, ${alpha})`;
			context.fillStyle = `rgb(${ind.color.r}, ${ind.color.g}, ${ind.color.b})`;
			context.fillText(ind.symbol, ind.x, ind.y - 30 + bounce);
			context.shadowBlur = 0;
		});
		context.globalAlpha = 1;
	}

	/**
	 * Render hit flash overlay for an entity
	 * Call this during entity render
	 */
	renderEntityHitFlash(entity, renderCallback) {
		const flashAlpha = this.getHitFlashAlpha(entity);

		// Normal render
		renderCallback();

		// Flash overlay
		if (flashAlpha > 0) {
			context.globalCompositeOperation = 'source-atop';
			context.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
			context.fillRect(
				entity.position.x, entity.position.y,
				entity.dimensions.x, entity.dimensions.y
			);
			context.globalCompositeOperation = 'source-over';
		}
	}
}
