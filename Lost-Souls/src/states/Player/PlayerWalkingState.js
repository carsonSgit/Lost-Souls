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
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.walkingSprites;
        console.log("Walking state: enter");

        this.player.attackHitbox.set(0, 0, 0, 0);
    }

    exit(){
        this.player.attackHitbox.set(0, 0, 0, 0);
    }
    update(dt){
        const objCollisions = this.player.checkObjectCollisions();

        if(!keys.a && !keys.d  && Math.abs(this.player.velocity.x) === 0){
            this.player.changeState(PlayerStateName.Idle);
        }
        if(keys[" "]){
            this.player.changeState(PlayerStateName.Attacking);
        }
        else if(objCollisions.length<= 0 && this.player.map.collisionLayer.getTile(Math.floor(this.player.position.x /Tile.SIZE) + 2, Math.floor((this.player.position.y + Player.HEIGHT) /Tile.SIZE)+ 1) == null)
        {
            this.player.changeState(PlayerStateName.Falling);
        }
        
        else if (keys.w) {
			this.player.changeState(PlayerStateName.Jumping);
		}
        // Checking if Left & Roll so that we can roll while moving
        else if(keys.a && keys.r){
            this.player.changeState(PlayerStateName.Rolling);
        }
        // Done after above check so that above is always hit first
        else if(keys.a){
            sounds.play(SoundName.Step);
            this.player.moveLeft();
        }
        // Checking if Right & Roll so that we can roll while moving
        else if(keys.d && keys.r){
            this.player.changeState(PlayerStateName.Rolling);
        }
        // Done after above check so that above is always hit first
        else if(keys.d){
            sounds.play(SoundName.Step);
            this.player.moveRight();
        }
        else
        {
            this.player.stop();
        }
    }
}