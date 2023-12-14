import Camera from "../../lib/Camera.js";
import Map from "../../lib/Map.js";
import State from "../../lib/State.js";
import SoundName from "../enums/SoundName.js";
import { sounds, timer } from "../globals.js";

export default class PlayState extends State {
	constructor() {
		super();

	}

	enter(parameters){
		this.map = parameters.map;
		sounds.play(SoundName.CaveTheme);
		
	}

	update(dt){
		timer.update(dt);
		this.map.update(dt);
	}

	render(context){
		context.save();
		this.map.render();
		context.restore();
	}
}
