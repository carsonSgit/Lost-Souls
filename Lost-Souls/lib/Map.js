import Colour from "../src/enums/Colour.js";
import Sprite from "./Sprite.js";
import Vector from "./Vector.js";
import ImageName from "../src/enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
import Camera from "./Camera.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	DEBUG,
	images,
	backgroundImage,
	VILLAGE_BACKGROUND_IMAGE_SRC,
	BOSS_ARENA_BACKGROUND_IMAGE_SRC,
	CAVE_BACKGROUND_IMAGE_SRC,
	sounds,
} from "../src/globals.js";
import Player from "../src/entities/Player.js";
import Platform from "../src/objects/Platform.js";
import Skeleton from "../src/entities/Skeleton.js";
import Door from "../src/objects/Door.js";
import Eye from "../src/entities/Eye.js";
import EnemyFactory from "../src/services/EnemyFactory.js";
import EnemyType from "../src/enums/EnemyType.js";
import Enemy from "../src/entities/Enemy.js";
import Sounds from "./Sounds.js";
import SoundName from "../src/enums/SoundName.js";
import Boss from "../src/entities/Boss.js";
import EntityEffects from "../src/objects/EntityEffects.js";

export default class Map {
	/**
	 * The collection of layers, sprites,
	 * and characters that comprises the world.
	 *
	 * @param {object} caveDefinition JSON from Tiled map editor.
	 */
	constructor(caveDefinition, villageDefinition, bossDefinition) {
		const sprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.Tiles),
			Tile.SIZE,
			Tile.SIZE,
		);

		this.caveCollisionLayer = new Layer(caveDefinition.layers[Layer.CAVE_COLLISION], sprites);
		this.villageCollisionLayer = new Layer(villageDefinition.layers[Layer.VILLAGE_COLLISION], sprites);
		this.bossCollisionLayer = new Layer(bossDefinition.layers[Layer.BOSS_COLLISION], sprites);

		// this.bottomLayer = new Layer(mapDefinition.layers[Layer.CAVE_BACKGROUND], sprites);
		this.collisionLayer = this.villageCollisionLayer;
		// this.midgroundLayer = new Layer(mapDefinition.layers[Layer.CAVE_MIDGROUND], sprites);
		this.player = new Player(new Vector(Player.SPRITE_WIDTH, Player.SPRITE_HEIGHT), new Vector(180, 384), new Vector(100, 10), this);
		
		this.skeletons = [EnemyFactory.createInstance(EnemyType.Skeleton, new Vector(Skeleton.SPRITE_WIDTH, Skeleton.SPRITE_HEIGHT), new Vector(100, 330), new Vector(100, 10), this),
			EnemyFactory.createInstance(EnemyType.Skeleton, new Vector(Skeleton.SPRITE_WIDTH, Skeleton.SPRITE_HEIGHT), new Vector(500, 330), new Vector(100, 10), this)
		]
		
		this.eyes = [EnemyFactory.createInstance(EnemyType.Eye, new Vector(Eye.FLIGHT_SPRITE_WIDTH, Eye.FLIGHT_SPRITE_HEIGHT), new Vector(400, 100), new Vector(100, 10), this),
			EnemyFactory.createInstance(EnemyType.Eye, new Vector(Eye.FLIGHT_SPRITE_WIDTH, Eye.FLIGHT_SPRITE_HEIGHT), new Vector(600, 200), new Vector(100, 10), this),
		]

		this.boss = EnemyFactory.createInstance(EnemyType.Boss, new Vector(Boss.SPRITE_WIDTH, Boss.SPRITE_HEIGHT), new Vector(784, 208), new Vector(100, 10), this);

		this.platforms = [new Platform(new Vector(Platform.PLATFORM_WIDTH + Platform.SUPPORTS_HEIGHT, Platform.PLATFORM_HEIGHT + Platform.SUPPORTS_HEIGHT), new Vector(100, 300 ), this),
			new Platform(new Vector(Platform.PLATFORM_WIDTH + Platform.SUPPORTS_HEIGHT, Platform.PLATFORM_HEIGHT + Platform.SUPPORTS_HEIGHT), new Vector(300, 200 ), this)];


		this.door = new Door(new Vector(Door.DOOR_WIDTH, Door.DOOR_HEIGHT), Door.DOOR_SPAWN_VILLAGE, this);

		// Initialize camera to follow the player
		const ORIGINAL_WIDTH = 960;
		const ORIGINAL_HEIGHT = 480;
		this.camera = new Camera(
			this.player,
			new Vector(ORIGINAL_WIDTH, ORIGINAL_HEIGHT),
			new Vector(ORIGINAL_WIDTH, ORIGINAL_HEIGHT),
			2, // 2x zoom
			0.05 // smooth speed (lower = smoother/slower, try 0.02-0.1)
		);

		// Entity effects system for combat visuals
		this.entityEffects = new EntityEffects();

		// Combat tracking
		this.comboCount = 0;
		this.comboTimer = 0;
		this.killCount = 0;
		this.lastHitTime = 0;

		// Track enemies hit by current attack to prevent multi-hit
		this.enemiesHitThisAttack = new Set();
		this.lastAttackHitboxActive = false;

		// Track if door effect has been created
		this.doorEffectCreated = false;
	}

	update(dt) {
		this.player.update(dt);
		this.camera.update(dt);

		// Update entity effects
		this.entityEffects.update(dt);

		// Update combo timer
		if (this.comboTimer > 0) {
			this.comboTimer -= dt;
			if (this.comboTimer <= 0) {
				this.comboCount = 0;
			}
		}

		// Track attack hitbox state - clear hit enemies when attack ends
		const attackHitboxActive = this.player.attackHitbox.dimensions.x > 0;
		if (!attackHitboxActive && this.lastAttackHitboxActive) {
			// Attack just ended, clear the hit tracking
			this.enemiesHitThisAttack.clear();
		}
		this.lastAttackHitboxActive = attackHitboxActive;

		this.platforms.forEach(platform => {
			platform.update(dt);
		});
		
	if(this.collisionLayer == this.bossCollisionLayer){
		this.boss.update(dt);

		// Hide door during boss fight and death animation
		if(this.boss.isDead && !this.boss.cleanUp){
			this.door.shouldRender = false;
			this.door.isSolid = false;
			this.door.isCollidable = false;
		}
	}
		
		if(this.collisionLayer == this.caveCollisionLayer){
			this.skeletons.forEach(skeleton => {
				skeleton.update(dt);
			});

			this.eyes.forEach(eye => {
				eye.update(dt);
				if(eye.projectile != null){
					eye.projectile.update(dt);
				}
			})
		

			
			this.skeletons.forEach(skeleton => {
				if(this.player.attackHitbox.didCollide(skeleton.hitbox) && !this.enemiesHitThisAttack.has(skeleton)) {
					// Mark as hit to prevent multi-hit
					this.enemiesHitThisAttack.add(skeleton);

					const wasAlive = !skeleton.isDead;
					skeleton.receiveDamage(this.player.strength);

					// Combat effects
					const hitX = skeleton.hitbox.position.x + skeleton.hitbox.dimensions.x / 2;
					const hitY = skeleton.hitbox.position.y + skeleton.hitbox.dimensions.y / 2;

					this.entityEffects.createHitImpact(hitX, hitY, this.player.direction);
					this.entityEffects.createBloodSplatter(hitX, hitY, this.player.direction);
					this.entityEffects.createHitFlash(skeleton, 0.1);

					// Combo tracking
					this.comboCount++;
					this.comboTimer = 2;

					// Death effects
					if (skeleton.isDead && wasAlive) {
						this.entityEffects.createDeathExplosion(hitX, hitY, 'skeleton');
						this.killCount++;
					}
				}

				if(skeleton.attackHitbox.didCollide(this.player.hitbox)) {
					if (!this.player.isInvulnerable) {
						const hitX = this.player.hitbox.position.x + this.player.hitbox.dimensions.x / 2;
						const hitY = this.player.hitbox.position.y + this.player.hitbox.dimensions.y / 2;
						this.entityEffects.createHitImpact(hitX, hitY, skeleton.direction === 'left' ? 'right' : 'left');
						this.entityEffects.createBloodSplatter(hitX, hitY, skeleton.direction === 'left' ? 'right' : 'left', 0.5);
					}
					this.player.receiveDamage(skeleton.strength);
				}
			});

			this.eyes.forEach(eye => {
				if(this.player.attackHitbox.didCollide(eye.hitbox) && !this.enemiesHitThisAttack.has(eye)){
					// Mark as hit to prevent multi-hit
					this.enemiesHitThisAttack.add(eye);

					const wasAlive = !eye.isDead;
					eye.receiveDamage(this.player.strength);

					// Combat effects
					const hitX = eye.hitbox.position.x + eye.hitbox.dimensions.x / 2;
					const hitY = eye.hitbox.position.y + eye.hitbox.dimensions.y / 2;

					this.entityEffects.createHitImpact(hitX, hitY, this.player.direction);
					this.entityEffects.createBloodSplatter(hitX, hitY, this.player.direction, 0.7);
					this.entityEffects.createHitFlash(eye, 0.1);

					// Combo tracking
					this.comboCount++;
					this.comboTimer = 2;

					// Death effects
					if (eye.isDead && wasAlive) {
						this.entityEffects.createDeathExplosion(hitX, hitY, 'eye');
						this.killCount++;
					}
				}

				if(eye.hitbox.didCollide(this.player.hitbox)){
					if (!this.player.isInvulnerable) {
						const hitX = this.player.hitbox.position.x + this.player.hitbox.dimensions.x / 2;
						const hitY = this.player.hitbox.position.y + this.player.hitbox.dimensions.y / 2;
						this.entityEffects.createHitImpact(hitX, hitY, 'left');
						this.entityEffects.createBloodSplatter(hitX, hitY, 'left', 0.5);
					}
					this.player.receiveDamage(eye.strength);
				}
				if(eye.projectile != null){
					if(eye.projectile.isDead){
						eye.projectile = null;
					}
					else if(this.player.hitbox.didCollide(eye.projectile.hitbox)){
						if (!this.player.isInvulnerable) {
							const hitX = this.player.hitbox.position.x + this.player.hitbox.dimensions.x / 2;
							const hitY = this.player.hitbox.position.y + this.player.hitbox.dimensions.y / 2;
							this.entityEffects.createHitImpact(hitX, hitY, 'left');
							this.entityEffects.createSpark(hitX, hitY, { count: 8, color: { r: 150, g: 50, b: 200 } });
						}
						this.player.receiveDamage(eye.projectile.strength);
						eye.projectile = null;
					}
					else if(this.player.attackHitbox.didCollide(eye.projectile.hitbox)){
						// Deflected projectile effect
						const projX = eye.projectile.hitbox.position.x;
						const projY = eye.projectile.hitbox.position.y;
						this.entityEffects.createSpark(projX, projY, { count: 10, color: { r: 200, g: 150, b: 255 } });
						eye.projectile = null;
						this.player.attackHitbox.set(0, 0, 0, 0);
					}
				}
			});
			

			this.platforms.forEach(platform => {
				if(platform.didCollideWithEntity(this.player.hitbox)) {

					if(platform.getEntityCollisionDirection(this.player.hitbox) == 0) {
						this.player.position.y = platform.position.y - this.player.dimensions.y;
						this.player.velocity.y = 0;
					}
					
				}
			});

			if(this.skeletons.every(skeleton => skeleton.isDead) && this.eyes.every(eye => eye.isDead)){
					if (!this.doorEffectCreated) {
						this.doorEffectCreated = true;
						this.entityEffects.createDoorPortal(
							this.door.position.x,
							this.door.position.y,
							Door.DOOR_SPRITE_WIDTH,
							Door.DOOR_SPRITE_HEIGHT
						);
					}
					this.door.isSolid = true;
					this.door.isCollidable = true;
					this.door.shouldRender = true;
			}

		}

		if(this.collisionLayer == this.bossCollisionLayer){
			if(this.player.attackHitbox.didCollide(this.boss.hitbox) && !this.enemiesHitThisAttack.has(this.boss)){
				// Mark as hit to prevent multi-hit
				this.enemiesHitThisAttack.add(this.boss);

				const wasAlive = !this.boss.isDead;
				this.boss.receiveDamage(this.player.strength);

				// Combat effects - boss has bigger impacts
				const hitX = this.boss.hitbox.position.x + this.boss.hitbox.dimensions.x / 2;
				const hitY = this.boss.hitbox.position.y + this.boss.hitbox.dimensions.y / 2;

				this.entityEffects.createHitImpact(hitX, hitY, this.player.direction, true); // Critical-style impact
				this.entityEffects.createBloodSplatter(hitX, hitY, this.player.direction, 1.5);
				this.entityEffects.createHitFlash(this.boss, 0.15);

				// Combo tracking
				this.comboCount++;
				this.comboTimer = 2;

				// Boss death effects - spectacular explosion
				if (this.boss.isDead && wasAlive) {
					this.entityEffects.createDeathExplosion(hitX, hitY, 'boss');
					this.killCount++;
				}
			}

			if(this.boss.attackHitbox.didCollide(this.player.hitbox)){
				if (!this.player.isInvulnerable) {
					const hitX = this.player.hitbox.position.x + this.player.hitbox.dimensions.x / 2;
					const hitY = this.player.hitbox.position.y + this.player.hitbox.dimensions.y / 2;
					this.entityEffects.createHitImpact(hitX, hitY, this.boss.direction === 'left' ? 'right' : 'left', true);
					this.entityEffects.createBloodSplatter(hitX, hitY, this.boss.direction === 'left' ? 'right' : 'left', 1);
				}
				this.player.receiveDamage(this.boss.strength);
			}
		}

		if(this.player.hitbox.didCollide(this.door.hitbox) && this.door.shouldRender) {
			// Clean up effects before room transition
			this.entityEffects.doorEffects = [];
			this.doorEffectCreated = false;

			// ternary? mess
			//check collision layer, if village, change to cave, if cave, change to boss, if boss, change to village
			// update player position and background image
			// update door location, dont render it right away on cave/boss map

			this.collisionLayer == this.villageCollisionLayer //if on village
			? (this.collisionLayer = this.caveCollisionLayer, // change to cave
				this.player.position = new Vector(100,200),
				this.door.position = Door.DOOR_SPAWN_CAVE,
				this.door.shouldRender = false,
				this.door.hitbox.position.x = this.door.position.x,
				this.door.hitbox.position.y = this.door.position.y + (Door.DOOR_SPRITE_HEIGHT-Door.DOOR_HEIGHT),
				backgroundImage.src = CAVE_BACKGROUND_IMAGE_SRC,
				sounds.stop(SoundName.VillageTheme),
				sounds.play(SoundName.CaveTheme))
				: this.collisionLayer == this.caveCollisionLayer // otherwise if on cave
				?(this.collisionLayer = this.bossCollisionLayer, // change to boss
					this.player.position = new Vector(100, 305),
					this.door.position = Door.DOOR_SPAWN_BOSS,
					this.door.shouldRender = false,
					this.door.hitbox.position.x = this.door.position.x,
					this.door.hitbox.position.y = this.door.position.y + (Door.DOOR_SPRITE_HEIGHT-Door.DOOR_HEIGHT),
					backgroundImage.src = BOSS_ARENA_BACKGROUND_IMAGE_SRC,
					sounds.stop(SoundName.CaveTheme),
					sounds.play(SoundName.BossFight))
					:(this.collisionLayer = this.villageCollisionLayer, // otherwise change to village
						this.player.position = new Vector(180, 384),
						this.door.position = Door.DOOR_SPAWN_VILLAGE,
						this.door.hitbox.position.x = this.door.position.x,
						this.door.hitbox.position.y = this.door.position.y + (Door.DOOR_SPRITE_HEIGHT-Door.DOOR_HEIGHT),
						backgroundImage.src = VILLAGE_BACKGROUND_IMAGE_SRC,
						sounds.stop(SoundName.BossFight),
						sounds.play(SoundName.VillageTheme),
						this.respawnEnemies()
						);

		}
		this.door.update(dt);

		
	}

	render() {
		// Calculate scale to fit original 960x480 game to new canvas size
		const ORIGINAL_WIDTH = 960;
		const ORIGINAL_HEIGHT = 480;
		const scaleX = CANVAS_WIDTH / ORIGINAL_WIDTH;
		const scaleY = CANVAS_HEIGHT / ORIGINAL_HEIGHT;

		// Save context state
		context.save();

		// Disable image smoothing for crisp pixel art (prevents gaps between tiles)
		context.imageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
		context.mozImageSmoothingEnabled = false;
		context.msImageSmoothingEnabled = false;

		// Apply scaling transformation
		context.scale(scaleX, scaleY);

		// Draw background at original size (will be scaled by transformation)
		context.drawImage(backgroundImage, 0, 0, ORIGINAL_WIDTH, ORIGINAL_HEIGHT);

		// Apply camera transformations (zoom and translation)
		// Round camera position to prevent sub-pixel rendering gaps between tiles
		context.scale(this.camera.zoom, this.camera.zoom);
		context.translate(Math.round(-this.camera.position.x), Math.round(-this.camera.position.y));

		//this.bottomLayer.render();
		if(this.collisionLayer == this.caveCollisionLayer){
			this.platforms.forEach(platform => {
				platform.render();
			});
		}
			this.collisionLayer.render();
			this.player.render();
		
		if(this.collisionLayer == this.caveCollisionLayer){

			this.skeletons.forEach(skeleton => {
				skeleton.render();
			});

			this.eyes.forEach(eye => {
				eye.render();
				if(eye.projectile != null){
					eye.projectile.render();
				}
			})
		}

		if(this.collisionLayer == this.bossCollisionLayer && !this.boss.isDead){
			this.boss.render();
		}
		
		if(this.door.shouldRender) {
			this.door.render();
		}
		
		// Render dead boss death animation on top of door
		if(this.collisionLayer == this.bossCollisionLayer && this.boss.isDead && !this.boss.cleanUp){
			this.boss.render();
		}

		this.entityEffects.render();

		//this.midgroundLayer.render();

		if (false){
			Map.renderGrid();
		}

		// Restore context state
		context.restore();
	}

	/**
	 * Draws a grid of squares on the screen to help with debugging.
	 */
	static renderGrid() {
		context.save();
		context.strokeStyle = Colour.White;

		for (let y = 1; y < CANVAS_HEIGHT / Tile.SIZE; y++) {
			context.beginPath();
			context.moveTo(0, y * Tile.SIZE);
			context.lineTo(CANVAS_WIDTH, y * Tile.SIZE);
			context.closePath();
			context.stroke();

			for (let x = 1; x < CANVAS_WIDTH / Tile.SIZE; x++) {
				context.beginPath();
				context.moveTo(x * Tile.SIZE, 0);
				context.lineTo(x * Tile.SIZE, CANVAS_HEIGHT);
				context.closePath();
				context.stroke();
			}
		}

		context.restore();
	}

	respawnEnemies(){
		this.skeletons = [EnemyFactory.createInstance(EnemyType.Skeleton, new Vector(Skeleton.SPRITE_WIDTH, Skeleton.SPRITE_HEIGHT), new Vector(100, 330), new Vector(100, 10), this),
			EnemyFactory.createInstance(EnemyType.Skeleton, new Vector(Skeleton.SPRITE_WIDTH, Skeleton.SPRITE_HEIGHT), new Vector(500, 330), new Vector(100, 10), this)
		]
		
		this.eyes = [EnemyFactory.createInstance(EnemyType.Eye, new Vector(Eye.FLIGHT_SPRITE_WIDTH, Eye.FLIGHT_SPRITE_HEIGHT), new Vector(400, 100), new Vector(100, 10), this),
			EnemyFactory.createInstance(EnemyType.Eye, new Vector(Eye.FLIGHT_SPRITE_WIDTH, Eye.FLIGHT_SPRITE_HEIGHT), new Vector(600, 200), new Vector(100, 10), this),
		]

		this.boss = EnemyFactory.createInstance(EnemyType.Boss, new Vector(Boss.SPRITE_WIDTH, Boss.SPRITE_HEIGHT), new Vector(784, 208), new Vector(100, 10), this);
	}
}