import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";
import GameObject from "./GameObject.js";

export default class Platform extends GameObject{

    static PLATFORM_TILE_LOCATIONS = [10, 22]
    static SUPPORTS_TILE_LOCATIONS = [54] // the spritesheet is killing me
    static PLATFORM_WIDTH = 176;
    static PLATFORM_HEIGHT = 16;

    static SUPPORTS_WIDTH = 64;
    static SUPPORTS_HEIGHT = 64;

    static SUPPORT_SPRITE_WIDTH = 55;
    static SUPPORT_SPRITE_HEIGHT = 48;

    constructor(dimensions, position){
        super(dimensions, position);
        this.isSolid = true;
        this.isCollidable = true;
        this.isConsumable = false;
        this.wasCollided = false;
        this.wasConsumed = false;

        this.platformSprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.Tiles),
            Platform.PLATFORM_WIDTH,
            Platform.PLATFORM_HEIGHT,
        );

        this.supportSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Tiles),
            Platform.SUPPORT_SPRITE_WIDTH,
            Platform.SUPPORT_SPRITE_HEIGHT,
        );
        console.log(this.supportSprites);
    }

    update(dt){
        super.update(dt);
    }

    render(offset = { x: 0, y: 0 }){
        super.render(offset);
    }

    onCollide(entity){
        this.wasCollided = true;
    }

    onConsume(consumer){
        return;
    }
}