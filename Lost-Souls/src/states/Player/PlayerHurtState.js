import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";

export default class PlayerHurtState extends State{
    constructor(player){
        super();

        this.player = player;


        this.animation = new Animation([0, 1, 2], 0.1, 1);
    }

    enter(){
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.hurtSprites;
        console.log('Hurt state: enter')
    }

    update(){
        if(this.player.currentAnimation.isDone()){
			this.player.currentAnimation.refresh();  
            if(this.player.health == 0){
                this.player.changeState(PlayerStateName.Dying);
            }  
            else{
                this.player.changeState(PlayerStateName.Idle);
            }
        }
        if(this.player.map.collisionLayer.getTile(Math.floor(this.player.position.x /Tile.SIZE) + 2, Math.floor((this.player.position.y + Player.HEIGHT) /Tile.SIZE)+ 1) == null)
        {
            this.player.changeState(PlayerStateName.Falling);
        }

    }
}