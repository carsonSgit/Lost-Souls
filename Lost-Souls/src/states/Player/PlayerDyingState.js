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
        // Play death sound
        sounds.play(SoundName.PlayerDeath);

        // Set death animation & sprites
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.dyingSprites;

        // Stop movement
        this.player.velocity.x=0;
    }

    exit(){
        this.player.attackHitbox.set(0, 0, 0, 0);
    }

    update(){
        if(this.player.currentAnimation.isDone()){
            // Play land sound for sprite's ground collision
            sounds.play(SoundName.Land);

            // Set high score as this current score
            this.player.highScore = this.player.score;

            // If this run's high score is higher than the local storage high score, store it as a high score
            if(this.player.highScore > localStorage.getItem('playerHighScore')){
                localStorage.setItem('playerHighScore', this.player.highScore);
            }

            // Reset player score to 0
            this.player.score = 0;
            // Store resetted score in local storage (this run is over, all saved data is reset)
            localStorage.setItem('playerScore', this.player.score);

            this.player.cleanUp = true;
            // Remove player hitbox
            this.player.hitbox.set(0, 0, 0, 0); 

            // Change Game State to GameOver
            stateMachine.change(
				GameStateName.GameOver,
				{
					map: this.player.map,
				});
        }
    }
}