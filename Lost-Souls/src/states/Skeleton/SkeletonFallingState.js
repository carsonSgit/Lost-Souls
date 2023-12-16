import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import { keys } from "../../globals.js";

export default class SkeletonFallingState extends State{

    /**
     * Skeleton Falling state
     * 
     * Moves the skeleton downwards until it reaches the ground level
     * 
     * !!!!! No longer necessary, current state of game has potential to change so not removing this code
     * @param {Enemy} skeleton 
     */
    constructor(skeleton){
        super();
        this.skeleton = skeleton;

        this.animation = new Animation([0, 1, 2, 3], 0.1);
    }

    enter(){
        // Set skeleton falling animation & sprites
        this.skeleton.currentAnimation = this.animation;
        this.skeleton.sprites = this.skeleton.fallingSprites;
    }
    
    exit(){
        this.skeleton.attackHitbox.set(0, 0, 0, 0);
    }

    update(dt){
        // Move downwards
        this.skeleton.moveDown(dt);
        
        // Are we on the ground? If so, change to idle state
        if(this.skeleton.velocity.y == 0){
            this.skeleton.changeState(EnemyStateName.Idle);
        }

    }
}