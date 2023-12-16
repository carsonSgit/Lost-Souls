import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import {isAABBCollision} from "../../lib/CollisionHelpers.js";
import { DEBUG, context } from "../globals.js";
import Hitbox from "../../lib/Hitbox.js";
import Player from "./Player.js";


export default class GameEntity{

    /*
    * @param {x:0, y:0} dimensions
    * @param {x:0, y:0} position
    */
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
        this.hitboxOffsets = new Hitbox();
		this.hitbox = new Hitbox(
			this.position.x + this.hitboxOffsets.position.x,
			this.position.y + this.hitboxOffsets.position.y,
			this.dimensions.x + this.hitboxOffsets.dimensions.x,
			this.dimensions.y + this.hitboxOffsets.dimensions.y,
		);
        this.isDead = false;
        this.cleanUp = false;
    }

    moveLeft(){

    }

    moveRight(){

    }

    changeState(state, params){
        this.stateMachine.change(state, params);
    }

    update(dt){
        // If entity has been killed and all animations have finished, do not update
        if(this.cleanUp){
            return;
        }

        // Call updates on entity's self
        this.stateMachine.update(dt);
        this.currentAnimation.update(dt);
        this.position.add(this.velocity, dt);
        // If still alive, keep tracking hitbox
        if(!this.isDead){
            this.hitbox.set(
                this.position.x + this.hitboxOffsets.position.x,
                this.position.y + this.hitboxOffsets.position.y,
                this.dimensions.x + this.hitboxOffsets.dimensions.x,
                this.dimensions.y + this.hitboxOffsets.dimensions.y,
            );
        }
    }

    render(offset){
        this.stateMachine.render(offset);

        this.renderEntity(offset);
    
        if(DEBUG){
            this.hitbox.render(context);
        }
    }

    renderEntity(offset){
        let renderX = Math.floor(this.position.x + offset.x);
        let renderY = Math.floor(this.position.y + offset.y);
    
        if (this.direction === Direction.Left) {
            context.save();
            context.translate(renderX + this.dimensions.x, renderY);
            context.scale(-1, 1);
            this.sprites[this.currentAnimation.getCurrentFrame()].render(0, 0);
            context.restore();
        }
        else {
            this.sprites[this.currentAnimation.getCurrentFrame()].render(renderX, renderY);
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

    receiveDamage(damage){
        this.currentHealth -= damage;
        if(this.currentHealth <= 0){
            this.isDead = true;
        }
    }

    /**
	 * @param {Entity} entity
	 * @returns The horizontal distance between this entity and the specified entity.
	 */
	getDistanceBetween(entity) {
		return Math.abs(this.position.x - entity.position.x);
	}
}