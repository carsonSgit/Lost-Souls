import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Eye from "../../entities/Eye.js";
import EnemyStateName from "../../enums/EnemyStateName.js";

export default class EyeIdleState extends State{
    
    constructor(eye){
        super();
        this.eye = eye;
        
        this.animation = new Animation([0, 1, 2, 3, 4, 5, 6, 7], 0.06);
    }

    enter(){
        this.eye.currentAnimation = this.animation;
        this.eye.sprites = this.eye.idleSprites;
        console.log("Eye idle state: enter");
    }

    update(dt){
        this.chase();
    }

    chase(){
        if(this.eye.getDistanceBetween(this.eye.map.player) <= Eye.CHASE_DISTANCE){
            this.eye.changeState(EnemyStateName.AttackMode)
        }
    }
}