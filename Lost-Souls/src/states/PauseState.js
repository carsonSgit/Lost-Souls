import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import SoundName from "../enums/SoundName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, keys, saveGameState, sounds, stateMachine } from "../globals.js";

export default class PauseState extends State{

    constructor(){
        super();
    }

    enter(parameters){
        this.map = parameters.map;
    }

    update(dt){
        // If 'P' key, Re-enter play-state
        if(keys.p || keys.P){
            // Play unpause sound effect
            sounds.play(SoundName.Unpause);
            sounds.stop(SoundName.Unpause);
            keys.p = false;
            keys.P = false;
            // Change back to play state
            stateMachine.change(
                GameStateName.Play,{
                    map: this.map,
                    fromPause: true
                }
            );
        }
        // Saving is enabled when the 's' key is pressed
        if(keys.s || keys.S){
            keys.s = false;
            keys.S = false;

            // Save player score to localStorage
            localStorage.setItem('playerScore', this.map.player.score);
        }
    }

    // Pause Screen Renders
    render(context){
        context.save();
        this.map.render();
        this.renderMenuScreen(context);
        context.restore();
    }

    // Pause Screen Rendering format
    renderMenuScreen(context){
        // Pause Screen Header
        context.font = '60px Dungeon';
        context.fillStyle = 'white';
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        context.fillText('Paused', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        // Pause Screen Exit prompt
        context.font = '24px Dungeon';
        context.fillStyle = 'black';
        context.fillText('Press \'P\' to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        
        // Pause Screen Save prompt
        context.font = '20px Dungeon';
        context.fillText('Press \'S\' to save score', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);

        // Player Score render
        context.font = '32px Dungeon';
        context.fillStyle = 'white';
        context.textAlign = 'right';
        context.fillText('Score: ' + this.map.player.score, CANVAS_WIDTH - 40, CANVAS_HEIGHT - 20);

        // Player High Score render
        context.textAlign = 'left';
        context.fillText('High Score: ' + this.map.player.highScore, 20, CANVAS_HEIGHT - 20);
    }
    
}