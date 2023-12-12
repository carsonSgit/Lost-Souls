import Sprite from "../../lib/Sprite.js";
import StateMachine from "../../lib/StateMachine.js";
import ImageName from "../enums/ImageName.js";
import { DEBUG, images, context} from "../globals.js";
import GameEntity from "./GameEntity.js"
import PlayerStateName from "../enums/PlayerStateName.js";
import PlayerIdleState from "../../src/states/Player/PlayerIdleState.js";
import PlayerWalkingState from "../states/Player/PlayerWalkingState.js";
import PlayerAttackingState from "../states/Player/PlayerAttackingState.js";
import PlayerRollingState from "../states/Player/PlayerRollingState.js";
import Direction from "../enums/Direction.js";
import Vector from "../../lib/Vector.js";
import Hitbox from "../../lib/Hitbox.js";

import Map from "../../lib/Map.js";
import PlayerPrayingState from "../states/Player/PlayerPrayingState.js";

export default class Player extends GameEntity{

    static HEIGHT = 48;
    static WIDTH = 32;

    static SPRITE_WIDTH = 128;
    static SPRITE_HEIGHT = 64;

    static WALKING_SPRITE_WIDTH = 128;
    static WALKING_SPRITE_HEIGHT = 64;
    static IDLE_SPRITE_WIDTH = 128;
    static IDLE_SPRITE_HEIGHT = 64;
    static ATTACKING_SPRITE_WIDTH = 128;
    static ATTACKING_SPRITE_HEIGHT = 64;
    static ROLLING_SPRITE_WIDTH = 128;
    static ROLLING_SPRITE_HEIGHT = 64;
    static PRAYING_SPRITE_WIDTH = 128;
    static PRAYING_SPRITE_HEIGHT = 64;
    static OFFSET_WIDTH = 128;
    static OFFSET_HEIGHT = 64;

    
    /** 
    * @param {Vector} dimensions
    * @param {Vector} position
    * @param {Vector} velocityLimit
    */
    constructor(dimensions, position, velocityLimit, map){
        super(dimensions, position, velocityLimit);

        this.gravityForce = new Vector(0, 1000);
        this.speedScalar = 0.7;
        this.frictionScalar = 0.7;
        this.positionOffset = new Vector(0, 0);
        this.hitboxOffsets = new Hitbox(48, 16, -Player.OFFSET_WIDTH + Player.WIDTH, -Player.OFFSET_HEIGHT+Player.HEIGHT);
        this.rollingHitboxOffsets = new Hitbox(48, 34, -Player.OFFSET_WIDTH + Player.WIDTH, -Player.OFFSET_HEIGHT+Player.HEIGHT - 18);

        this.attackHitbox = new Hitbox(0, 0, 0, 0, 'blue');

        this.idleSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.PlayerIdle),
            Player.IDLE_SPRITE_WIDTH,
            Player.IDLE_SPRITE_HEIGHT,
        );
        this.walkingSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.PlayerWalk),
            Player.WALKING_SPRITE_WIDTH,
            Player.WALKING_SPRITE_HEIGHT,
        );
        this.attackingSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.PlayerAttack),
            Player.ATTACKING_SPRITE_WIDTH,
            Player.ATTACKING_SPRITE_HEIGHT,
        );
        this.rollingSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.PlayerRoll),
            Player.ROLLING_SPRITE_WIDTH,
            Player.ROLLING_SPRITE_HEIGHT,
        );
        this.prayingSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.PlayerPray),
            Player.PRAYING_SPRITE_WIDTH,
            Player.PRAYING_SPRITE_HEIGHT,
        )


        this.sprites = this.idleSprites;

        this.stateMachine = this.initializeStateMachine();
        
        this.map = map;
    }

    render(){
        context.save();

        super.render(this.positionOffset);
        
        context.restore();

        if(DEBUG){
            this.attackHitbox.render(context);
        }
    }

    initializeStateMachine(){

        const stateMachine = new StateMachine();
        stateMachine.add(PlayerStateName.Idle, new PlayerIdleState(this));
        stateMachine.add(PlayerStateName.Walking, new PlayerWalkingState(this));
        stateMachine.add(PlayerStateName.Attacking, new PlayerAttackingState(this));
        stateMachine.add(PlayerStateName.Rolling, new PlayerRollingState(this));
        stateMachine.add(PlayerStateName.Praying, new PlayerPrayingState(this));

        stateMachine.change(PlayerStateName.Praying);

        return stateMachine;
    }

    moveLeft() {
		this.direction = Direction.Left;
		this.velocity.x = Math.max(this.velocity.x - this.speedScalar * this.frictionScalar, -this.velocityLimit.x);

        if(this.map.collisionLayer.getTile(Math.floor(this.position.x / 12) + 1, Math.floor(this.position.y / 12))){
            this.velocity.x = 0;
        }
	}



    
	moveRight() {
		this.direction = Direction.Right;
		this.velocity.x = Math.min(this.velocity.x + this.speedScalar * this.frictionScalar, this.velocityLimit.x);
    }

    moveUp(){
        this.direction = Direction.Up;
        this.velocity.y = Math.max(this.velocity.y - this.speedScalar * this.frictionScalar, -this.velocityLimit.y);
    }

    moveDown(){
        this.direction = Direction.Down;
        this.velocity.y = Math.min(this.velocity.y + this.speedScalar * this.frictionScalar, this.velocityLimit.y);
    }

    stop() {
		if (Math.abs(this.velocity.x) > 0) {
			this.velocity.x *= this.frictionScalar;
		}

		if (Math.abs(this.velocity.x) < 0.1) {
			this.velocity.x = 0;
		}
	}

    
}