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
        if(keys.Escape){
            keys.Escape = false;
            stateMachine.change(
                GameStateName.Play,{
                    map: this.map
                }
            );
        }
        /* saving is disabled for now
        if(keys.s || keys['S']){
            keys.s = false;
            keys['S'] = false;
            saveGameState();
        }*/
    }

    render(context){
        context.save();
        this.map.render();
        this.renderMenuScreen(context);
        context.restore();
    }

    renderMenuScreen(context){
        context.font = '60px Dungeon';
        context.fillStyle = 'white';
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        context.fillText('Paused', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        context.font = '24px Dungeon';
        context.fillText('Press Escape to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        

        // Renders player score
        context.font = '32px Dungeon';
        context.textAlign = 'right';
        context.fillText('Score: ' + this.map.player.score, CANVAS_WIDTH - 50, CANVAS_HEIGHT - 20);
    }
    
}