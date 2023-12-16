import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js"
import Skeleton from "../../entities/Skeleton.js";
import { keys } from "../../globals.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Direction from "../../enums/Direction.js";

export default class SkeletonAttackModeState extends State{

    constructor(skeleton){
        super();
        this.skeleton = skeleton;

        this.animation = new Animation([0, 1, 2, 3], 0.2);
    }

    enter(){
        // Set skeleton movement animation & sprites
        this.skeleton.currentAnimation = this.animation;
        this.skeleton.sprites = this.skeleton.walkingSprites;
        
        this.skeleton.attackHitbox.set(0, 0, 0, 0);
    }

    exit(){
        this.skeleton.attackHitbox.set(0, 0, 0, 0);
    }

    update(dt){
        // If skeleton is floating, change to fall state
        if(this.skeleton.map.collisionLayer.getTile(Math.floor(this.skeleton.position.x /Tile.SIZE) + 2, Math.floor((this.skeleton.position.y + Skeleton.HEIGHT) /Tile.SIZE)+ 3) == null)
        {
            this.skeleton.changeState(EnemyStateName.Falling);
        }
        // Decide direction & move accordingly
        this.decideDirection();
        this.move();
    }

    /**
     * Decides which direction the skeleton should move
     * 
     * Taken / tweaked from Vikram Singh's Mario code
     * @see: https://github.com/JAC-CS-Game-Programming-F23/3-Mario/blob/main/src/Mario-9/src/states/entity/snail/SnailChasingState.js 
     */
    decideDirection() {
        // If skeleton is floating, fall
        if(this.skeleton.map.collisionLayer.getTile(Math.floor(this.skeleton.position.x /Tile.SIZE) + 2, Math.floor((this.skeleton.position.y + Skeleton.HEIGHT) /Tile.SIZE)+ 3) == null)
        {
            this.skeleton.changeState(EnemyStateName.Falling);
        }
        // If player is within attack distance, change to attacking state
        else if (this.skeleton.getDistanceBetween(this.skeleton.map.player) < (Skeleton.CHASE_DISTANCE - 35)) {
            this.skeleton.changeState(EnemyStateName.Attacking);
        }
        // If the player is on the left of the skeleton, set skeleton direction to left
        else if (this.skeleton.map.player.position.x < this.skeleton.position.x) {
            this.skeleton.direction = Direction.Left;
        }
        // If the player is on the right of the skeleton, set skeleton direction to right
        else {
            this.skeleton.direction = Direction.Right;
        }
    }

    move(dt) {
        // Simple movement based on direction
        if (this.skeleton.direction === Direction.Left) {
            this.skeleton.moveLeft();
        }
        else if (this.skeleton.direction === Direction.Right) {
            this.skeleton.moveRight();
        }
    }
}