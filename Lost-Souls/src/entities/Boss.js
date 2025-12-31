import Hitbox from "../../lib/Hitbox.js";
import Sprite from "../../lib/Sprite.js";
import StateMachine from "../../lib/StateMachine.js";
import Tile from "../../lib/Tile.js";
import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import EnemyStateName from "../enums/EnemyStateName.js";
import ImageName from "../enums/ImageName.js";
import SoundName from "../enums/SoundName.js";
import { DEBUG, context, images, sounds } from "../globals.js";
import BossAttackModeState from "../states/Boss/BossAttackModeState.js";
import BossAttackingState from "../states/Boss/BossAttackingState.js";
import BossDeathState from "../states/Boss/BossDeathState.js";
import BossHurtState from "../states/Boss/BossHurtState.js";
import BossIdleSate from "../states/Boss/BossIdleState.js";
import BossSpawnState from "../states/Boss/BossSpawnState.js";
import Enemy from "./Enemy.js";

export default class Boss extends Enemy{

    static WIDTH = 96;
    static HEIGHT = 96;

    static SPAWN_OFFSET_WIDTH = -178;
    static OFFSET_WIDTH = 288;
    static OFFSET_HEIGHT = 160;

    static SPAWN_SPRITE_WIDTH = 74;
    static SPAWN_SPRITE_HEIGHT = 160;

    static SPAWN_SPRITE_LOCATION = [4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5];
    static IDLE_SPRITE_LOCATION = [0, 1, 2, 3, 4, 5];
    static WALKING_SPRITE_LOCATION = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];
    static ATTACK_SPRITE_LOCATION = [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54 ,55 ,56, 57 , 58];
    static HURT_SPRITE_LOCATION = [66, 67, 68, 69, 70];
    static DEATH_SPRITE_LOCATION = [88, 89, 90, 91, 92, 93, 94, 95, 96, 97 ,98 ,99 ,100 ,101 ,102 ,103 ,104, 105, 106, 107, 108, 109];

    static SPRITE_WIDTH = 288;
    static SPRITE_HEIGHT = 160;

    static CHASE_DISTANCE = Boss.WIDTH * 3;


    constructor(dimensions, position, velocityLimit, map){
        super(dimensions, position, velocityLimit);

        this.map = map;
        this.spawning = true;

        this.gravityForce = new Vector(0, 1000);

        this.speedScalar = 0.3;
        this.frictionScalar = 0.1;

        this.direction = Direction.Left;

        this.positionOffset =  new Vector(-Boss.SPRITE_WIDTH,0);
        this.attackHitbox = new Hitbox(0, 0, 0, 0, 'blue');
        this.hitboxOffsets = new Hitbox(Boss.WIDTH - Boss.SPRITE_WIDTH, Boss.HEIGHT-Tile.SIZE * 2, -Boss.OFFSET_WIDTH + Boss.WIDTH, -Boss.OFFSET_HEIGHT+Boss.HEIGHT);        

        
        this.spawnSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.BossSpawn),
            Boss.SPAWN_SPRITE_WIDTH,
            Boss.SPAWN_SPRITE_HEIGHT,
        );

        this.allSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Boss),
            Boss.SPRITE_WIDTH,
            Boss.SPRITE_HEIGHT,
        );

        this.sprites = this.allSprites;

        // Boss specific entity values (strength & score)
        this.strength = 4;
        this.scoreValue = 50;

        // Boss health (10 hits to kill with player strength of 2)
        this.totalHealth = 20;
        this.currentHealth = 20;

        this.stateMachine = new StateMachine();
        this.stateMachine.add(EnemyStateName.Spawn, new BossSpawnState(this));
        this.stateMachine.add(EnemyStateName.Idle, new BossIdleSate(this));
        this.stateMachine.add(EnemyStateName.AttackMode, new BossAttackModeState(this));
        this.stateMachine.add(EnemyStateName.Attacking, new BossAttackingState(this));
        this.stateMachine.add(EnemyStateName.Hurt, new BossHurtState(this));
        this.stateMachine.add(EnemyStateName.Death, new BossDeathState(this));
        this.stateMachine.change(EnemyStateName.Idle);
    }

    update(dt){
        super.update(dt);

        // If boss is spawning, change to spawn state
        if(this.spawning){
            this.stateMachine.change(EnemyStateName.Spawn);
            this.spawning = false;
        }
    }

    // Renders...
    render(){
        context.save();
        super.render(this.positionOffset);

        context.restore();

        if(DEBUG){
            this.attackHitbox.render(context);
        }
    }

    moveLeft() {
		this.direction = Direction.Left;
		this.velocity.x = Math.max(this.velocity.x - this.speedScalar * this.frictionScalar, -this.velocityLimit.x);

        // Collision detection
        if(this.map.collisionLayer.getTile(Math.ceil(this.position.x /Tile.SIZE) + 2, Math.ceil(this.position.y /Tile.SIZE)) !== null) {
            this.velocity.x = 0;
        }
	}

    moveRight() {
		this.direction = Direction.Right;
		this.velocity.x = Math.min(this.velocity.x + this.speedScalar * this.frictionScalar, this.velocityLimit.x);

        // Collision detection
        if(this.map.collisionLayer.getTile(Math.ceil((this.position.x + Boss.WIDTH) / Tile.SIZE) + 2, Math.ceil(this.position.y /Tile.SIZE)) !== null) {
            this.velocity.x = 0;
        }
    }

    receiveDamage(damage){
        super.receiveDamage(damage);

        // Is it alive? ...
        if(!this.isDead){
            sounds.play(SoundName.Sword_Hit)
            this.changeState(EnemyStateName.Hurt);
        }
        // It is dead, change state
        else if(!this.cleanUp){
            this.changeState(EnemyStateName.Death);
        }
    }

    /**
	 * @param {Entity} entity
	 * @returns The horizontal distance between this entity and the specified entity.
	 */
	getDistanceBetween(entity) {
        // changing to use boss's hitbox
		return Math.abs(this.hitbox.position.x - entity.position.x);
	}

    //Boss sprite sheet is facing left, so we need to flip it
    renderEntity(offset){
        let renderX = Math.floor(this.position.x + offset.x);
        let renderY = Math.floor(this.position.y + offset.y);
    
        if (this.direction === Direction.Left) {
            this.sprites[this.currentAnimation.getCurrentFrame()].render(renderX, renderY);
        }
        else {
            context.save();
            context.translate(renderX + Boss.SPRITE_WIDTH, renderY);
            context.scale(-1, 1);
            this.sprites[this.currentAnimation.getCurrentFrame()].render(0, 0);
            context.restore();
        }
    }
}