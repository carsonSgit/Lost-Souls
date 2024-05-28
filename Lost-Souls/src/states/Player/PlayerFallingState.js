import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import SoundName from "../../enums/SoundName.js";
import { keys, sounds } from "../../globals.js";

export default class PlayerFallingState extends State{

    constructor(player){
        super();

        this.player = player;

        this.animation = new Animation([0, 1, 2, 3], 0.1);
        // Save normal player's hitbox
        this.ogHitboxOffsets = this.player.hitboxOffsets;
    }

    enter(){
        // Set falling animation & sprites
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.fallingSprites;

        // Change hitbox to shrunk falling hitbox
        this.player.hitboxOffsets = this.player.fallingHitboxOffsets;
    }

    exit(){
        // Reset player hitbox
        this.player.hitboxOffsets = this.ogHitboxOffsets;
        this.player.attackHitbox.set(0, 0, 0, 0);
    }
    
    update(dt){
        // Move player down (Fall)
        this.player.moveDown(dt);
        
        // Move left while falling
        if(keys.a || keys.A || keys.ArrowLeft){
            this.player.moveLeft();
        }
        // Move right while falling
        else if(keys.d || keys.D || keys.ArrowRight){
            this.player.moveRight();
        }
        // Do not move if no lateral movement
        else{
            this.player.stop();
        }

        // If lateral movement on landing, straight to walking to keep velocity
        if(((keys.a || keys.d) || (keys.A || keys.D) || (keys.ArrowLeft || keys.ArrowRight)) && this.player.velocity.y == 0){
            sounds.play(SoundName.Land);
            this.player.changeState(PlayerStateName.Walking);
        }
        // If no movement on landing, straight to idle
        else if(this.player.velocity.y == 0){
            sounds.play(SoundName.Land);
            this.player.changeState(PlayerStateName.Idle);
        }
    }
}