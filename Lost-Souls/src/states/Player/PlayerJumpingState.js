import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys, sounds } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";
import Vector from "../../../lib/Vector.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerJumpingState extends State{
    constructor(player){
        super();

        this.player = player;
        this.jumpForce = new Vector(0, -500);

        this.animation = new Animation([0, 1, 2, 3], 0.1);
        
        this.ogHitboxOffsets = this.player.hitboxOffsets;
    }

    enter(){
        // Set jumping animation & sprites
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.fallingSprites;

        // Set our velocity to the jumping velocity
        this.player.velocity.y = this.jumpForce.y;
        // Shrink our hitbox
        this.player.hitboxOffsets = this.player.jumpingHitboxOffsets;
    }

    exit(){
        // Reset our hitbox
        this.player.hitboxOffsets = this.ogHitboxOffsets;
        this.player.attackHitbox.set(0, 0, 0, 0);
    }

    update(dt){
        // Play the jump sound effect
        sounds.play(SoundName.Jump)

        // Move up
        this.player.moveUp(dt);

        // Did we reach the peak of our jump?
        if(this.player.velocity.y >= 0){
            this.player.changeState(PlayerStateName.Falling);
        }
        // Move left while jumping
        if (keys.a || keys.A) {
			this.player.moveLeft();
		}
        // Move right while jumping
        else if (keys.d || keys.D){
			this.player.moveRight();
        }
    }
}