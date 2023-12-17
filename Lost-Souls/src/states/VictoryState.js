import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, keys, stateMachine } from "../globals.js";

export default class VictoryState extends State {
	constructor() {
		super();
	}

	enter(parameters){
		this.map = parameters.map;
	}

	update(dt){
		if(keys.Enter){
			keys.Enter = false;
			stateMachine.change(GameStateName.Play, 
				{
					map: this.map
			});
		}
	}

	render(context){
		context.save();
		this.map.render();
		this.renderVictoryScreen(context);
		context.restore();
	}

	renderVictoryScreen(context){
		// Victory Header
		context.font = '60px Pixeloid';
		context.fillStyle = 'black';
		context.shadowColor = 'rgb(255, 20, 20)';
		context.shadowOffset = {x: 2, y: 2};
		context.shadowBlur = 3;
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Victory', CANVAS_WIDTH/2, CANVAS_HEIGHT/ 2 - 20);

		// This run's Score Display 
		context.shadowBlur = 1;
		context.font = '24px Pixeloid';
		context.fillText('Score: ' + this.map.player.highScore, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

		// Return to game prompt
		context.font = '18px Pixeloid';
		context.fillText('Press Enter to return to the game', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
	}
}
