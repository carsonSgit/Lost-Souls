import Colour from "../src/enums/Colour.js";
import Sprite from "./Sprite.js";
import Vector from "./Vector.js";
import ImageName from "../src/enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
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
	}

	update(dt) {
		this.player.update(dt);

		this.platforms.forEach(platform => {
			platform.update(dt);
		});
		
		if(this.collisionLayer == this.bossCollisionLayer){
			this.boss.update(dt);

			if(this.boss.isDead){
				this.door.isSolid = true;
				this.door.isCollidable = true;
				this.door.shouldRender = true;
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
				if(this.player.attackHitbox.didCollide(skeleton.hitbox)) {
					skeleton.receiveDamage(this.player.strength);
					this.player.attackHitbox.set(0, 0, 0, 0);
				}

				if(skeleton.attackHitbox.didCollide(this.player.hitbox)) {
					this.player.receiveDamage(skeleton.strength);
				}
			});

			this.eyes.forEach(eye => {
				if(this.player.attackHitbox.didCollide(eye.hitbox)){
					eye.receiveDamage(this.player.strength);
					this.player.attackHitbox.set(0, 0, 0, 0);
				}

				if(eye.hitbox.didCollide(this.player.hitbox)){
					this.player.receiveDamage(eye.strength);
				}
				if(eye.projectile != null){
					if(eye.projectile.isDead){
						eye.projectile = null;
					}
					else if(this.player.hitbox.didCollide(eye.projectile.hitbox)){
						this.player.receiveDamage(eye.projectile.strength);
						eye.projectile = null;
					}
					else if(this.player.attackHitbox.didCollide(eye.projectile.hitbox)){
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

			// Check all enemies are dead for door to spawn
			if(this.skeletons.every(skeleton => skeleton.isDead) && this.eyes.every(eye => eye.isDead)){
					this.door.isSolid = true;
					this.door.isCollidable = true;
					this.door.shouldRender = true;
			}

		}

		if(this.collisionLayer == this.bossCollisionLayer){
			if(this.player.attackHitbox.didCollide(this.boss.hitbox)){
				this.boss.receiveDamage(this.player.strength);
				this.player.attackHitbox.set(0, 0, 0, 0);
			}

			if(this.boss.attackHitbox.didCollide(this.player.hitbox)){
				this.player.receiveDamage(this.boss.strength);
			}
		}

		if(this.player.hitbox.didCollide(this.door.hitbox) && this.door.shouldRender) {
			// ternary? mess
			//check collision layer, if village, change to cave, if cave, change to boss, if boss, change to village
			// update player position and background image
			// update door location, dont render it right away on cave/boss map

			this.collisionLayer == this.villageCollisionLayer //if on village
			? (this.collisionLayer = this.caveCollisionLayer, // change to cave
				this.player.position = new Vector(100,200),
				this.door.position = Door.DOOR_SPAWN_CAVE,
				this.door.shouldRender = false,
				this.door.hitbox.position.y = this.door.position.y + (Door.DOOR_SPRITE_HEIGHT-Door.DOOR_HEIGHT),
				backgroundImage.src = CAVE_BACKGROUND_IMAGE_SRC,
				sounds.stop(SoundName.VillageTheme),
				sounds.play(SoundName.CaveTheme)) 
				: this.collisionLayer == this.caveCollisionLayer // otherwise if on cave
				?(this.collisionLayer = this.bossCollisionLayer, // change to boss
					this.player.position = new Vector(100, 306),
					this.door.position = Door.DOOR_SPAWN_BOSS,
					this.door.shouldRender = false,
					this.door.hitbox.position.y = this.door.position.y + (Door.DOOR_SPRITE_HEIGHT-Door.DOOR_HEIGHT),
					backgroundImage.src = BOSS_ARENA_BACKGROUND_IMAGE_SRC,
					sounds.stop(SoundName.CaveTheme),
					sounds.play(SoundName.BossFight))
					:(this.collisionLayer = this.villageCollisionLayer, // otherwise change to village
						this.player.position = new Vector(180, 384),
						this.door.position = Door.DOOR_SPAWN_VILLAGE,
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
		context.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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

		// FOR TESTING  REMOVE COMMENT BELOW AFTER
		if(this.collisionLayer == this.bossCollisionLayer){
			this.boss.render();
		}
		
		if(this.door.shouldRender)
			this.door.render();

		//this.midgroundLayer.render();

		if (false){
			Map.renderGrid();
		}
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