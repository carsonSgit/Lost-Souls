import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, keys, stateMachine } from "../globals.js";

export default class GameOverState extends State {
	constructor() {
		super();
	}

	enter(parameters){
		console.log('Game Over State: Enter');
		this.map = parameters.map;
	}

	update(dt){
		if(keys.Enter){
			keys.Enter = false;
			console.log('Game Over State: Exit');
			stateMachine.change(GameStateName.TitleScreen);
		}
	}

	render(context){
		context.save();
		this.map.render();
		this.renderGameOverScreen(context);
		context.restore();
	}

	renderGameOverScreen(context){
		context.font = '60px Pixeloid';
		context.fillStyle = 'black';
		context.shadowColor = 'rgb(255, 0, 0)';
		context.shadowOffset = {x: 2, y: 2};
		context.shadowBlur = 15;
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Game Over', CANVAS_WIDTH/2, CANVAS_HEIGHT/ 2 - 20);
		context.font = '24px Pixeloid';
		context.fillText('Press Enter to return to title screen', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
	}
}
