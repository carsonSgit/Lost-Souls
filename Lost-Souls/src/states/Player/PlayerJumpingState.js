import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";
import Vector from "../../../lib/Vector.js";

export default class PlayerJumpingState extends State{
    constructor(player){
        super();

        this.player = player;
        this.jumpForce = new Vector(0, -500);


        this.animation = new Animation([0, 1, 2, 3], 0.1);
        
        this.ogHitboxOffsets = this.player.hitboxOffsets;
    }

    enter(){
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.fallingSprites;
        console.log('Jumping State: enter')
        this.player.velocity.y = this.jumpForce.y;
        this.player.hitboxOffsets = this.player.jumpingHitboxOffsets;
        //this.player.attackHitbox.set(0, 0, 0, 0);
    }

    exit(){
        this.player.hitboxOffsets = this.ogHitboxOffsets;
    }

    update(dt){
        this.player.moveUp(dt);
        if(this.player.velocity.y >= 0){
            this.player.changeState(PlayerStateName.Falling);
        }
        /*else if(this.player.map.collisionLayer.getTile(Math.floor(this.player.position.x /Tile.SIZE) + 2, Math.floor((this.player.position.y + Player.HEIGHT) /Tile.SIZE)+ 1) == null)
        {
            this.player.changeState(PlayerStateName.Falling);
        }*/
        if (keys.a) {
			this.player.moveLeft();
		}
        else if (keys.d){
			this.player.moveRight();
        }

    }
}