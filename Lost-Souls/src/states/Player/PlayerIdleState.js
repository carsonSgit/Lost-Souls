import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";

export default class PlayerIdleState extends State{
    constructor(player){
        super();

        this.player = player;

        this.animation = new Animation([0, 1, 2, 3, 4, 5], 0.1);
    }

    enter(){
        // Set idle animation & sprites
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.idleSprites;
        
        this.player.attackHitbox.set(0, 0, 0, 0);
    }

    exit(){
        this.player.attackHitbox.set(0, 0, 0, 0);
    }
    
    update(){
        // Store object collision check results
        const objCollisions = this.player.checkObjectCollisions();

        // Did we hit space-bar? ... Attack!!!
        if(keys[" "]){
            this.player.changeState(PlayerStateName.Attacking);
        }
        // Are we floating? ... Then fall!!!
        else if(objCollisions <= 0 && this.player.map.collisionLayer.getTile(Math.floor(this.player.position.x /Tile.SIZE) + 2, Math.floor((this.player.position.y + Player.HEIGHT) /Tile.SIZE)+ 1) == null)
        {
            this.player.changeState(PlayerStateName.Falling);
        }
        // Are movement keys being pressed? If so, walk
        else if (keys.a || keys.d || keys.A || keys.D || keys.ArrowLeft || keys.ArrowRight) {
			this.player.changeState(PlayerStateName.Walking);
		}
        // Are we pressing the jump key? If so, jump
        else if (keys.w || keys.W || keys.ArrowUp) {
			this.player.changeState(PlayerStateName.Jumping);
		}
        // Are we pressing the roll key? If so, roll
        else if (keys.r || keys.R){
            this.player.changeState(PlayerStateName.Rolling);
        }
        // Are we pressing the heal key? If so, heal
        else if (keys.h || keys.H){
            this.player.changeState(PlayerStateName.Healing);
        }
    }
}