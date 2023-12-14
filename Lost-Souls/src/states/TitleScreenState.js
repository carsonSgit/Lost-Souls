import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import Map from "../../lib/Map.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	keys,
	sounds,
	stateMachine,
} from "../globals.js";
import SoundName from "../enums/SoundName.js";
export default class TitleScreenState extends State {
	constructor(mapDefinition) {
		super();

		this.map = new Map(mapDefinition);
		
		console.log(this.mapDefinition);

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
		sounds.play(SoundName.VillageTheme);
	}

	exit(){
		sounds.stop(SoundName.VillageTheme);
	}

	render(context){
		context.save();
		this.map.render();
		this.renderTitleWindow(context);
		context.restore();
	}

	renderTitleWindow(context) {
		context.font = '60px Dungeon';
		context.fillStyle = 'white';
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
		context.font = '24px Dungeon';
		context.fillText('Press Enter', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
	}
}
