import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys,
    sounds,
    stateMachine } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";
import GameStateName from "../../enums/GameStateName.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerDyingState extends State{
    constructor(player){
        super();

        this.player = player;


        this.animation = new Animation([0, 1, 2, 3], 0.4, 1);
    }

    enter(){
        sounds.play(SoundName.PlayerDeath);
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.dyingSprites;
        this.player.velocity.x=0;
        console.log('Dying state: enter')
    }

    exit(){
        this.player.attackHitbox.set(0, 0, 0, 0);
    }

    update(){
        if(this.player.currentAnimation.isDone()){
            sounds.play(SoundName.Land);
            this.player.highScore = this.player.score;
            if(this.player.highScore > localStorage.getItem('playerHighScore')){
                localStorage.setItem('playerHighScore', this.player.highScore);
            }
            this.player.score = 0;
            localStorage.setItem('playerScore', this.player.score);

            this.player.cleanUp = true;
            this.player.hitbox.set(0, 0, 0, 0); 
            stateMachine.change(
				GameStateName.GameOver,
				{
					map: this.player.map,
				});
        }
    }
}