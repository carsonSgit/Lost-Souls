import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";

export default class PlayerWalkingState extends State{
    constructor(player){
        super();

        this.player = player;

        this.animation = new Animation([0, 1, 2, 3, 4, 5, 6, 7], 0.1);
    }

    enter(){
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.walkingSprites;
        console.log("Walking state: enter");

        this.player.attackHitbox.set(0, 0, 0, 0);
    }

    update(dt){
        if(!keys.a && !keys.d  && Math.abs(this.player.velocity.x) === 0){
            this.player.changeState(PlayerStateName.Idle);
        }
        if(keys[" "]){
            this.player.changeState(PlayerStateName.Attacking);
        }
        else if(keys.a){
            this.player.moveLeft();
        }
        else if(keys.d){
            this.player.moveRight();
        }
        else if (keys.r){
            this.player.changeState(PlayerStateName.Rolling);
        }
        else
        {
            this.player.stop();
        }

        
    }
}