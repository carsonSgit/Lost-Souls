import Sprite from "../../lib/Sprite.js";
import StateMachine from "../../lib/StateMachine.js";
import ImageName from "../enums/ImageName.js";
import { DEBUG, images, context} from "../globals.js";
import GameEntity from "./GameEntity.js"
import PlayerStateName from "../enums/PlayerStateName.js";
import PlayerIdleState from "../../src/states/Player/PlayerIdleState.js";
import PlayerWalkingState from "../states/Player/PlayerWalkingState.js";
import Direction from "../enums/Direction.js";
import Vector from "../../lib/Vector.js";

export default class Player extends GameEntity{

    static WALKING_SPRITE_WIDTH = 128;
    static WALKING_SPRITE_HEIGHT = 64;
    static IDLE_SPRITE_WIDTH = 128;
    static IDLE_SPRITE_HEIGHT = 64;
    
    /** 
    * @param {Vector} dimensions
    * @param {Vector} position
    * @param {Vector} velocityLimit
    */
    constructor(dimensions, position, velocityLimit){
        super(dimensions, position, velocityLimit);

        this.speedScalar = 0.5;
        this.frictionScalar = 0.8;
        this.positionOffset = new Vector(0, 0);

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

        this.sprites = this.idleSprites;

        this.stateMachine = this.initializeStateMachine();
        
    }

    render(){
        context.save();

        super.render(this.positionOffset);

        context.restore();
    }

    initializeStateMachine(){

        const stateMachine = new StateMachine();
        stateMachine.add(PlayerStateName.Idle, new PlayerIdleState(this));
        stateMachine.add(PlayerStateName.Walking, new PlayerWalkingState(this));

        stateMachine.change(PlayerStateName.Idle);

        return stateMachine;
    }

    moveLeft() {
		this.direction = Direction.Left;
		this.velocity.x = Math.max(this.velocity.x - this.speedScalar * this.frictionScalar, -this.velocityLimit.x);
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
        console.log(Math.abs(this.velocity.x))
		if (Math.abs(this.velocity.x) > 0) {
			this.velocity.x *= this.frictionScalar;
		}

		if (Math.abs(this.velocity.x) < 0.1) {
			this.velocity.x = 0;
		}
	}

    
}