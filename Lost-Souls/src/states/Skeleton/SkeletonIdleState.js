import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js"
import Skeleton from "../../entities/Skeleton.js";
import { keys } from "../../globals.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";
import EnemyStateName from "../../enums/EnemyStateName.js";

export default class SkeletonIdleState extends State{

    constructor(skeleton){
        super();
        this.skeleton = skeleton;

        this.animation = new Animation([0, 1, 2, 3], 0.15);
    }

    enter(){
        // Skeleton Idle animation & sprites
        this.skeleton.currentAnimation = this.animation;
        this.skeleton.sprites = this.skeleton.idleSprites;
    }

    exit(){
        this.skeleton.attackHitbox.set(0, 0, 0, 0);
    }
    
    update(dt){
        // Is the skeleton floating? If so, change to falling state
        if(this.skeleton.map.collisionLayer.getTile(Math.floor(this.skeleton.position.x /Tile.SIZE) + 2, Math.floor((this.skeleton.position.y + Skeleton.HEIGHT) /Tile.SIZE)+ 3) == null)
        {
            this.skeleton.changeState(EnemyStateName.Falling);
        }
        // Chase the player
        this.chase();
    }


    /**
     * Checks if the player is within the chase distance
     * 
     * Taken from Vikram Singh's Mario code
     * @see https://github.com/JAC-CS-Game-Programming-F23/3-Mario/blob/main/src/Mario-9/src/states/entity/snail/SnailIdleState.js
     */
    chase(){
        // If the player is within chase distance, change state to attack mode
        if(this.skeleton.getDistanceBetween(this.skeleton.map.player) <= Skeleton.CHASE_DISTANCE){
            this.skeleton.changeState(EnemyStateName.AttackMode)
        }
    }
}