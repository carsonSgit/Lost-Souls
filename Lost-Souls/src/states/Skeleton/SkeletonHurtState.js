

import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js"
import Skeleton from "../../entities/Skeleton.js";
import { keys } from "../../globals.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Direction from "../../enums/Direction.js";

export default class SkeletonHurtState extends State{

    constructor(skeleton){
        super();
        this.skeleton = skeleton;

        this.animation = new Animation([0, 1, 2, 3], 0.2, 1);
    }

    enter(){
        // Set skeleton hurt animation & sprites
        this.skeleton.currentAnimation = this.animation;
        this.skeleton.sprites = this.skeleton.hurtSprites;

        // Stop movement
        this.skeleton.velocity.x = 0;
    }

    exit(){
        this.skeleton.attackHitbox.set(0, 0, 0, 0);
    }

    update(dt){
        // Is the hurt animation done?
        if(this.skeleton.currentAnimation.isDone()){
			this.skeleton.currentAnimation.refresh();  
            // Is the skeleton dead? If so, change state to dying
            if(this.skeleton.isDead){
                this.skeleton.changeState(EnemyStateName.Dying);
            }
            // If it isn't dead, change state to idle
            else{
                this.skeleton.changeState(EnemyStateName.Idle);
            }
        }
    }
}