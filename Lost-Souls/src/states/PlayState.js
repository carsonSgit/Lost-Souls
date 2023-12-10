import Camera from "../../lib/Camera.js";
import Map from "../../lib/Map.js";
import State from "../../lib/State.js";

export default class PlayState extends State {
	constructor(caveDefinition) {
		super();

		this.map = new Map(caveDefinition)
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

	render(context){
		context.save();
		this.map.render();
		context.restore();
	}
}
