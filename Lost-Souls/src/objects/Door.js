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

    static DOOR_SPAWN_VILLAGE = new Vector(784, 368);
    static DOOR_SPAWN_CAVE = new Vector(784, 352);
    static DOOR_SPAWN_BOSS = new Vector(784, 288);

    constructor(dimensions, position, map){
        super(dimensions, position);

        this.wasCollided = false;
        this.wasConsumed = false;

        this.map = map;

        this.shouldRender = this.map.collisionLayer === this.map.villageCollisionLayer;

        this.hitbox.position.x = this.position.x;
        this.hitbox.position.y = this.position.y + (Door.DOOR_SPRITE_HEIGHT-Door.DOOR_HEIGHT);

        this.sprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Tiles),
            Door.DOOR_SPRITE_WIDTH,
            Door.DOOR_SPRITE_HEIGHT,
        );
    }

    update(dt){
        super.update(dt);
    }

    render(offset = { x: 0, y: 0 }){
        const x = this.position.x + offset.x;
        const y = this.position.y + offset.y;
        const spriteIndex = Door.DOOR_TILE_LOCATIONS[0];
        
        if (this.sprites && this.sprites[spriteIndex]) {
            const sprite = this.sprites[spriteIndex];
            if (sprite.graphic && sprite.graphic.loaded && sprite.graphic.image) {
                context.drawImage(
                    sprite.graphic.image,
                    sprite.x,
                    sprite.y,
                    sprite.width,
                    sprite.height,
                    Math.floor(x),
                    Math.floor(y),
                    sprite.width,
                    sprite.height
                );
            } else {
                console.log('Door sprite graphic not loaded:', sprite.graphic ? (sprite.graphic.loaded ? 'loaded but no image' : 'not loaded') : 'no graphic');
                context.fillStyle = 'rgba(255, 255, 0, 0.7)';
                context.fillRect(Math.floor(x), Math.floor(y), Door.DOOR_SPRITE_WIDTH, Door.DOOR_SPRITE_HEIGHT);
            }
        } else {
            console.log('Door sprite missing at index:', spriteIndex);
            context.fillStyle = 'rgba(0, 255, 0, 0.5)';
            context.fillRect(Math.floor(x), Math.floor(y), Door.DOOR_SPRITE_WIDTH, Door.DOOR_SPRITE_HEIGHT);
        }
        
        if (DEBUG) {
            context.fillStyle = 'rgba(255, 0, 0, 0.3)';
            context.fillRect(Math.floor(x), Math.floor(y), Door.DOOR_SPRITE_WIDTH, Door.DOOR_SPRITE_HEIGHT);
            this.hitbox.render(context);
        }
    }
}