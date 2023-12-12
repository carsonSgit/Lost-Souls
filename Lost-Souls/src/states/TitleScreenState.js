import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import Map from "../../lib/Map.js";
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
		this.map.update(dt)

		if(keys.Enter){
			this.map.player.stateMachine.currentState.stopPraying();
			stateMachine.change(
				GameStateName.Play,
				{
					map: this.map,
				});
		}
	}

	enter(){

	}

	exit(){

	}

	render(context){
		context.save();
		this.renderTitleWindow(context);
		this.map.render();
		context.restore();
	}

	renderTitleWindow(context) {
		context.fillRect(30, 30, CANVAS_WIDTH - 60, CANVAS_HEIGHT - 60);
		context.font = '60px Dungeon';
		context.fillStyle = 'white';
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
		context.font = '24px Dungeon';
		context.fillText('Press Enter', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
	}
}
