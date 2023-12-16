import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, keys, stateMachine, sounds } from "../globals.js";
import SoundName from "../enums/SoundName.js";

export default class GameOverState extends State {

	constructor() {
		super();
	}

	enter(parameters){
		this.map = parameters.map;
	}

	update(dt){
		// If enter key is pressed, return to title screen
		if(keys.Enter){
			keys.Enter = false;
			stateMachine.change(GameStateName.TitleScreen);
		}
	}

	render(context){
		context.save();
		this.map.render();
		this.renderGameOverScreen(context);
		context.restore();
	}

	// Game Over Rendering
	renderGameOverScreen(context){
		// Game Over Header
		context.font = '60px Pixeloid';
		context.fillStyle = 'black';
		context.shadowColor = 'rgb(255, 20, 20)';
		context.shadowOffset = {x: 2, y: 2};
		context.shadowBlur = 3;
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Game Over', CANVAS_WIDTH/2, CANVAS_HEIGHT/ 2 - 20);

		// This run's Score Display 
		context.shadowBlur = 1;
		context.font = '24px Pixeloid';
		context.fillText('Score: ' + this.map.player.highScore, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

		// Return to Title Screen Prompt
		context.font = '18px Pixeloid';
		context.fillText('Press Enter to return to title screen', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
	}
}
