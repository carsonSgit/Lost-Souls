import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	keys,
	stateMachine,
} from "../globals.js";
export default class TitleScreenState extends State {
	constructor(mapDefinition) {
		super();

		this.map = new Map(mapDefinition);

	}
	update(dt){
	}

	enter(){

	}

	exit(){

	}

	render(context){
		context.save();
		//this.renderTitleWindow(context);
		this.map.render();
		context.restore();
	}

	renderTitleWindow(context) {
		context.fillRect(30, 30, CANVAS_WIDTH - 60, CANVAS_HEIGHT - 60);
		context.font = '40px Dungeon';
		context.fillStyle = 'white';
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
		context.font = '20px Dungeon';
		context.fillText('Press Enter', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
	}
}
