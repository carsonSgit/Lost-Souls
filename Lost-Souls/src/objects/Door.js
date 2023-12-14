import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import ImageName from "../enums/ImageName.js";
import { DEBUG, context, images } from "../globals.js";
import GameObject from "./GameObject.js";

export default class Door extends GameObject{

    static DOOR_TILE_LOCATIONS = [15];
    static DOOR_SPRITE_WIDTH = 64;
    static DOOR_SPRITE_HEIGHT = 80;

    static DOOR_WIDTH = 46;
    static DOOR_HEIGHT = 64;

    static DOOR_SPAWN = new Vector(784, 355);

    constructor(dimensions, position){
        super(dimensions, position);
        
        this.wasCollided = false;
        this.wasConsumed = false;

        this.hitbox.position.y = this.position.y + (Door.DOOR_SPRITE_HEIGHT-Door.DOOR_HEIGHT);

        this.sprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Tiles),
            Door.DOOR_SPRITE_WIDTH,
            Door.DOOR_SPRITE_HEIGHT,
        );

        console.log(this.sprites);
    }

    update(dt){
        super.update(dt);
        // if enemies are dead 
        //this.isSolid = true;
        //this.isCollidable = true;
        //render door
    }

    render(offset = { x: 0, y: 0 }){
        const x = this.position.x + offset.x;
        const y = this.position.y + offset.y;

        this.sprites[Door.DOOR_TILE_LOCATIONS[0]].render(Math.floor(x), Math.floor(y));

        if (DEBUG) {
			this.hitbox.render(context);
		}
    }
}