import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import { keys } from "../../globals.js";

export default class PlayerFallingState extends State{

    constructor(player){
        super();

        this.player = player;

        this.animation = new Animation([0, 1, 2, 3], 0.1);
        this.ogHitboxOffsets = this.player.hitboxOffsets;
    }

    enter(){
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.fallingSprites;
        this.player.hitboxOffsets = this.player.fallingHitboxOffsets;
        console.log("Falling state: enter");
    }

    exit(){
        this.player.hitboxOffsets = this.ogHitboxOffsets;
    }

    update(dt){
        this.player.moveDown(dt);
        
        if(keys.a){
            this.player.moveLeft();
        }
        else if(keys.d){
            this.player.moveRight();
        }
        else{
            this.player.stop();
        }

        if((keys.a || keys.d) && this.player.velocity.y == 0){
            this.player.changeState(PlayerStateName.Walking);
        }
        else if(this.player.velocity.y == 0){
            this.player.changeState(PlayerStateName.Idle);
        }

    }
}