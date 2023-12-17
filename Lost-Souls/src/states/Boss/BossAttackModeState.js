import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Boss from "../../entities/Boss.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";

export default class BossAttackModeState extends State{

    constructor(boss){
        super();
        this.boss = boss;

        this.animation = new Animation(Boss.WALKING_SPRITE_LOCATION, 0.2);
    }

    enter(){
        console.log('Boss attack mode state: enter');
        this.boss.currentAnimation = this.animation;
        this.boss.sprites = this.boss.allSprites;
    }

    exit(){
        console.log('Boss attack mode state: exit');
    }

    update(dt){
        // Decide direction & move accordingly
        this.decideDirection();
        this.move();
        this.boss.attackHitbox.set(0, 0, 0, 0);

    }

    /**
     * Decides which direction the boss should move
     * 
     * Taken / tweaked from Vikram Singh's Mario code
     * @see: https://github.com/JAC-CS-Game-Programming-F23/3-Mario/blob/main/src/Mario-9/src/states/entity/snail/SnailChasingState.js 
     */
    decideDirection() {
        // If player is within attack distance, change to attacking state
        if (this.boss.getDistanceBetween(this.boss.map.player) < (Boss.CHASE_DISTANCE - 100)) {
            this.boss.changeState(EnemyStateName.Attacking);
        }
        // If the player is on the left of the boss, set boss direction to left
        if (this.boss.map.player.hitbox.position.x < this.boss.hitbox.position.x) {
            this.boss.direction = Direction.Left;
        }
        // If the player is on the right of the boss, set boss direction to right
        else {
            this.boss.direction = Direction.Right;
        }
    }

    move(dt) {
        // Simple movement based on direction
        if (this.boss.direction === Direction.Left) {
            this.boss.moveLeft();
        }
        else if (this.boss.direction === Direction.Right) {
            this.boss.moveRight();
        }
    }

}