import Animation from "../../../lib/Animation.js";
import Hitbox from "../../../lib/Hitbox.js";
import State from "../../../lib/State.js";
import Tile from "../../../lib/Tile.js";
import Eye from "../../entities/Eye.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";

export default class EyeAttackModeState extends State{
    constructor(eye){
        super();

        this.eye = eye;
        this.animation = new Animation([0, 1, 2, 3, 4, 5, 6, 7], 0.04);
    }

    enter(){
        this.eye.currentAnimation = this.animation;
        this.eye.sprites = this.eye.idleSprites;
    }

    update(dt){
        this.decideDirection();
        this.move(dt);
    }

    /**
     * Decides which direction the eye should move
     * 
     * Taken / tweaked from Vikram Singh's Mario code
     * @see: https://github.com/JAC-CS-Game-Programming-F23/3-Mario/blob/main/src/Mario-9/src/states/entity/snail/SnailChasingState.js 
     */
    decideDirection() {
        if (this.eye.getDistanceBetween(this.eye.map.player) < (Eye.CHASE_DISTANCE - 35)) {
            this.eye.changeState(EnemyStateName.Attacking);
        }
        else if (this.eye.map.player.position.x < this.eye.position.x) {
            this.eye.direction = Direction.Left;
        }
        else {
            this.eye.direction = Direction.Right;
        }
    }

    move(dt) {
        // Simple movement
        if (this.eye.direction === Direction.Left) {
            this.eye.moveLeft(dt);
        }
        else if (this.eye.direction === Direction.Right) {
            this.eye.moveRight(dt);
        }
    }
}