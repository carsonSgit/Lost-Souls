import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys,
    stateMachine } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";
import GameStateName from "../../enums/GameStateName.js";

export default class PlayerDyingState extends State{
    constructor(player){
        super();

        this.player = player;


        this.animation = new Animation([0, 1, 2, 3], 0.4, 1);
    }

    enter(){
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.dyingSprites;
        console.log('Dying state: enter')
    }

    update(){
        if(this.player.currentAnimation.isDone()){
			//this.player.currentAnimation.refresh();  
            /*stateMachine.change(
				GameStateName.GameOver,
				{
					map: this.player.map,
				});*/
        }
    }
}