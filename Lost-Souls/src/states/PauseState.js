import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, keys, saveGameState, stateMachine } from "../globals.js";

export default class PauseState extends State{

    constructor(){
        super();
    }

    enter(parameters){
        this.map = parameters.map;
    }

    update(dt){
        // If Escape key, Re-enter play-state
        if(keys.Escape){
            keys.Escape = false;
            stateMachine.change(
                GameStateName.Play,{
                    map: this.map
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

    render(context){
        context.save();
        this.map.render();
        this.renderMenuScreen(context);
        context.restore();
    }

    // Pause Screen Rendering
    renderMenuScreen(context){
        // Pause Screen Header
        context.font = '60px Dungeon';
        context.fillStyle = 'white';
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        context.fillText('Paused', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        // Pause Screen Exit prompt
        context.font = '24px Dungeon';
        context.fillText('Press Escape to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        

        // Player Score render
        context.font = '32px Dungeon';
        context.textAlign = 'right';
        context.fillText('Score: ' + this.map.player.score, CANVAS_WIDTH - 40, CANVAS_HEIGHT - 20);

        // Player High Score render
        context.textAlign = 'left';
        context.fillText('High Score: ' + this.map.player.highScore, 20, CANVAS_HEIGHT - 20);
    }
    
}