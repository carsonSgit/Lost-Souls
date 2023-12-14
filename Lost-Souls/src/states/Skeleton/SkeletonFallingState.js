import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import { keys } from "../../globals.js";

export default class SkeletonFallingState extends State{

    constructor(skeleton){
        super();
        this.skeleton = skeleton;

        this.animation = new Animation([0, 1, 2, 3], 0.1);
    }

    enter(){
        this.skeleton.currentAnimation = this.animation;
        this.skeleton.sprites = this.skeleton.fallingSprites;
        console.log("Skeleton Falling state: enter");
    }
    
    exit(){
        this.skeleton.attackHitbox.set(0, 0, 0, 0);
    }

    update(dt){
        this.skeleton.moveDown(dt);
        
        if(this.skeleton.velocity.y == 0){
            this.skeleton.changeState(EnemyStateName.Idle);
        }

    }
}