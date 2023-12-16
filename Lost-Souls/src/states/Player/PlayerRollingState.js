import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys, sounds } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Direction from "../../enums/Direction.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerRollingState extends State{
    constructor(player){
        super();

        this.player = player;

        this.animation = new Animation([0, 1, 2, 3, 4, 6, 7, 8, 9], 0.1 , 1);

        this.originalHitboxOffsets = this.player.hitboxOffsets;
    }

    enter(){
        // Play sliding sound effect
        sounds.play(SoundName.Slide);

        // Set sliding animation & sprites
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.rollingSprites;

        // Increase speed
        this.player.speedScalar = 1;

        // Shrink hitbox
        this.player.hitboxOffsets = this.player.rollingHitboxOffsets;
    }

    exit(){
        // Reset hitbox
        this.player.hitboxOffsets = this.originalHitboxOffsets;
        this.player.attackHitbox.set(0, 0, 0, 0);
    }
    update(){
        // Animation finished? 
        if(this.player.currentAnimation.isDone()){
			this.player.currentAnimation.refresh();   
            // Are we trying to move? If so, change to walking state
            if((keys.a || keys.d) || (keys.A || keys.D)){
                this.player.changeState(PlayerStateName.Walking);
            }
            // No movement input detected, reset to idle state (no speed boost)
            else {
                this.player.speedScalar = .7;
                this.player.velocity.x = 0;
                this.player.changeState(PlayerStateName.Idle);
            }
        }
        // Were we facing left? Slide leftwards
        if(this.player.direction === Direction.Left){
            this.player.moveLeft();
        }
        // Were we facing right? Slide rightwards
        if(this.player.direction === Direction.Right){
            this.player.moveRight();
        }
    }
}