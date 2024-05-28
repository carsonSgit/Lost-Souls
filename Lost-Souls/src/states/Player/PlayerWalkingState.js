import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys, sounds } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Player from "../../entities/Player.js";
import Tile from "../../../lib/Tile.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerWalkingState extends State{
    constructor(player){
        super();

        this.player = player;

        this.animation = new Animation([0, 1, 2, 3, 4, 5, 6, 7], 0.09);
    }

    enter(){
        // Set to walking animation & sprites
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.walkingSprites;

        this.player.attackHitbox.set(0, 0, 0, 0);
    }

    exit(){
        this.player.attackHitbox.set(0, 0, 0, 0);
    }

    update(dt){
        // Store object collision check result
        const objCollisions = this.player.checkObjectCollisions();

        // If no movement keys are being pressed, change to idle state
        if(((!keys.a && !keys.d) || (!keys.A && !keys.D))  && Math.abs(this.player.velocity.x) === 0){
            this.player.changeState(PlayerStateName.Idle);
        }
        // If we hit space-bar, change to attacking state
        if(keys[" "]){
            this.player.changeState(PlayerStateName.Attacking);
        }
        // Are we floating? If so, change to falling state
        else if(objCollisions.length<= 0 && this.player.map.collisionLayer.getTile(Math.floor(this.player.position.x /Tile.SIZE) + 2, Math.floor((this.player.position.y + Player.HEIGHT) /Tile.SIZE)+ 1) == null)
        {
            this.player.changeState(PlayerStateName.Falling);
        }
        // If we hit jump button, change to jumping state
        else if (keys.w || keys.W || keys.ArrowUp) {
			this.player.changeState(PlayerStateName.Jumping);
		}
        // Checking if Left Movement & Slide button pressed so that we can roll while moving
        else if((keys.a && keys.r) || (keys.A && keys.R) || (keys.ArrowLeft && keys.r) || (keys.ArrowLeft && keys.R)){
            this.player.changeState(PlayerStateName.Rolling);
        }
        // Done after above check so that above is always hit first
            // Are we moving left? Play movement audio & move leftwards
        else if(keys.a || keys.A || keys.ArrowLeft){
            sounds.play(SoundName.Step);
            this.player.moveLeft();
        }
        // Checking if Right Movement & Slide button pressed so that we can roll while moving
        else if((keys.d && keys.r) || (keys.D && keys.R) || (keys.ArrowRight && keys.r) || (keys.ArrowRight && keys.R)){
            this.player.changeState(PlayerStateName.Rolling);
        }
        // Done after above check so that above is always hit first
            // Are we moving right? Play movement audio & move rightwards
        else if(keys.d || keys.D || keys.ArrowRight){
            sounds.play(SoundName.Step);
            this.player.moveRight();
        }
        // No movement keys pressed, stop moving
        else {
            this.player.stop();
        }
    }
}