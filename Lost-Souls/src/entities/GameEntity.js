import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import {isAABBCollision} from "../../lib/CollisionHelpers.js";


export default class GameEntity{

    constructor(dimensions, position, velocityLimit){
        this.dimensions = dimensions;
        this.position = position;
        this.velocityLimit = velocityLimit;

        this.velocity = new Vector(0, 0);
        this.totalHealth = 100;
        this.currentHealth = 100;
        this.sprites = [];
        this.stateMachine = null;
        this.currentAnimation = null;
        this.direction = Direction.Right;
        //this.hitbox
        //this.hitboxOffsets = {x: 0, y: 0};
        //this.attackHitbox
        this.isDead = false;
        this.cleanUp = false;
        // this.renderPriority
    }

    changeState(state, params){
        this.stateMachine.change(state, params);
    }

    update(dt){
        this.stateMachine.update(dt);
        this.currentAnimation.update(dt);
        this.position.add(this.velocity, dt);
    }

    render(offset){
        this.stateMachine.render(offset);
        if(this.isDead){
            return;
        }

        this.renderEntity(offset);
    }

    renderEntity(){
        if (this.direction === Direction.Left) {
			context.save();
			context.translate(Math.floor(this.position.x) + this.dimensions.x, Math.floor(this.position.y));
			context.scale(-1, 1);
			this.sprites[this.currentAnimation.getCurrentFrame()].render(0, 0);
			context.restore();
		}
		else {
			this.sprites[this.currentAnimation.getCurrentFrame()].render(Math.floor(this.position.x), Math.floor(this.position.y));
		}
    }

    /**
	 * @param {Entity} entity
	 * @returns Whether this entity collided with another using AABB collision detection.
	 */
	didCollideWithEntity(entity) {
		return isAABBCollision(
			this.position.x,
			this.position.y,
			this.dimensions.x,
			this.dimensions.y,
			entity.position.x,
			entity.position.y,
			entity.dimensions.x,
			entity.dimensions.y,
		);
	}
}