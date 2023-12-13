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
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.idleSprites;
        console.log('Idle State: enter')
        
        this.player.attackHitbox.set(0, 0, 0, 0);
    }

    update(){
        if(keys[" "]){
            this.player.changeState(PlayerStateName.Dying);
        }
        else if(this.player.map.collisionLayer.getTile(Math.floor(this.player.position.x /Tile.SIZE) + 2, Math.floor((this.player.position.y + Player.HEIGHT) /Tile.SIZE)+ 1) == null)
        {
            this.player.changeState(PlayerStateName.Falling);
        }
        else if (keys.a || keys.d) {
			this.player.changeState(PlayerStateName.Walking);

		}
        else if (keys.w) {
			this.player.changeState(PlayerStateName.Jumping);
		}
        else if (keys.r){
            this.player.changeState(PlayerStateName.Rolling);
        }

    }
}