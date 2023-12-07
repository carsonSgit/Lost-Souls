import Camera from "../../lib/Camera.js";
import State from "../../lib/State.js";

export default class PlayState extends State {
	constructor() {
		super();
	}

	enter(parameters){
		this.level = parameters.level;
		this.player = parameters.player;

		this.camera = new Camera(
			this.player,
			this.level.tilemap.dimensions,
			new Vector(CANVAS_WIDTH, CANVAS_HEIGHT),
		);
	}
}
