import Camera from "../../lib/Camera.js";
import Map from "../../lib/Map.js";
import State from "../../lib/State.js";

export default class PlayState extends State {
	constructor() {
		super();

	}

	enter(parameters){
		this.map = parameters.map;

		
	}

	update(dt){
		this.map.update(dt);
	}

	render(context){
		context.save();
		this.map.render();
		context.restore();
	}
}
