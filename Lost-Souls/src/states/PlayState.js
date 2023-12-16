import Camera from "../../lib/Camera.js";
import Map from "../../lib/Map.js";
import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import SoundName from "../enums/SoundName.js";
import { keys, sounds, stateMachine, timer } from "../globals.js";

export default class PlayState extends State {
	constructor() {
		super();

	}

	enter(parameters){
		this.map = parameters.map;
		// Play Village Theme sound
		sounds.play(SoundName.VillageTheme);
	}

	update(dt){
		timer.update(dt);
		this.map.update(dt);

		// If key p is pressed, change to Pause state
		if(keys.p || keys.P){
			keys.p = false;
			stateMachine.change(
				GameStateName.Pause, {
					map: this.map
				}
			);
		}
	}

	render(context){
		context.save();
		this.map.render();
		context.restore();
	}
}
