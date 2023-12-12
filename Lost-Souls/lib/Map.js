import Colour from "../src/enums/Colour.js";
import Sprite from "./Sprite.js";
import Vector from "./Vector.js";
import ImageName from "../src/enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	DEBUG,
	images,
} from "../src/globals.js";
import Player from "../src/entities/Player.js";
import Platform from "../src/objects/Platform.js";

export default class Map {
	/**
	 * The collection of layers, sprites,
	 * and characters that comprises the world.
	 *
	 * @param {object} mapDefinition JSON from Tiled map editor.
	 */
	constructor(mapDefinition) {
		console.log(mapDefinition.layers)
		const sprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.Tiles),
			Tile.SIZE,
			Tile.SIZE,
		);
		// this.bottomLayer = new Layer(mapDefinition.layers[Layer.CAVE_BACKGROUND], sprites);
		this.collisionLayer = new Layer(mapDefinition.layers[Layer.CAVE_COLLISION], sprites);
		// this.midgroundLayer = new Layer(mapDefinition.layers[Layer.CAVE_MIDGROUND], sprites);
		this.player = new Player(new Vector(Player.SPRITE_WIDTH, Player.SPRITE_HEIGHT), new Vector(180, 235), new Vector(100, 10), this);
		this.platforms = new Platform(new Vector(Platform.PLATFORM_WIDTH + Platform.SUPPORTS_HEIGHT, Platform.PLATFORM_HEIGHT + Platform.SUPPORTS_HEIGHT), new Vector(100, 100));
	}

	update(dt) {
		this.player.update(dt);
		this.platforms.update(dt);
	}

	render() {
		//this.bottomLayer.render();
		this.collisionLayer.render();
		this.platforms.render();
		this.player.render();
		//this.midgroundLayer.render();

		if (false){
			Map.renderGrid();
		}
	}

	/**
	 * Draws a grid of squares on the screen to help with debugging.
	 */
	static renderGrid() {
		context.save();
		context.strokeStyle = Colour.White;

		for (let y = 1; y < CANVAS_HEIGHT / Tile.SIZE; y++) {
			context.beginPath();
			context.moveTo(0, y * Tile.SIZE);
			context.lineTo(CANVAS_WIDTH, y * Tile.SIZE);
			context.closePath();
			context.stroke();

			for (let x = 1; x < CANVAS_WIDTH / Tile.SIZE; x++) {
				context.beginPath();
				context.moveTo(x * Tile.SIZE, 0);
				context.lineTo(x * Tile.SIZE, CANVAS_HEIGHT);
				context.closePath();
				context.stroke();
			}
		}

		context.restore();
	}
}