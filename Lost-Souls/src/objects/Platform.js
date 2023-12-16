import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images, DEBUG, context } from "../globals.js";
import GameObject from "./GameObject.js";

export default class Platform extends GameObject{

    static PLATFORM_TILE_LOCATIONS = [10, 22]
    static SUPPORTS_TILE_LOCATIONS = [54] // the spritesheet is killing me

    static PLATFORM_WIDTH = 176;
    static PLATFORM_HEIGHT = 16;

    static SUPPORTS_WIDTH = 64;
    static SUPPORTS_HEIGHT = 64;

    static PLATFORM_SPRITE_WIDTH = 185;
    static PLATFORM_SPRITE_HEIGHT = 16;

    static SUPPORT_SPRITE_WIDTH = 55;
    static SUPPORT_SPRITE_HEIGHT = 48;

    static SUPPORT_SPRITE_SPAWN_OFFSET = 22;

    constructor(dimensions, position, map){
        super(dimensions, position);

        this.map = map;

        this.isSolid = true;
        this.isCollidable = true;
        this.isConsumable = false;
        this.wasCollided = false;
        this.wasConsumed = false;
        this.numOfSupports = this.getRandomNumberOfSupports();

        this.shouldCollide = true;

        this.hitbox.position.x = this.position.x + (Platform.PLATFORM_SPRITE_WIDTH - Platform.PLATFORM_WIDTH);
        this.hitbox.position.y = this.position.y;
        this.hitbox.dimensions.x = Platform.PLATFORM_WIDTH;
        this.hitbox.dimensions.y = Platform.PLATFORM_HEIGHT;

        this.platformSprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.Tiles),
            Platform.PLATFORM_SPRITE_WIDTH,
            Platform.PLATFORM_SPRITE_HEIGHT,
        );

        this.supportSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Tiles),
            Platform.SUPPORT_SPRITE_WIDTH,
            Platform.SUPPORT_SPRITE_HEIGHT,
        );
    }

    update(dt){
        super.update(dt);

        if(this.map.collisionLayer == this.map.villageCollisionLayer || this.map.collisionLayer == this.map.bossCollisionLayer){
            this.shouldCollide = false;
        }else{
            this.shouldCollide = true;
        }
    }

    render(offset = { x: 0, y: 0 }){
    
        const x = this.position.x + offset.x;
        const y = this.position.y + offset.y;

        // Render platform sprite
        this.platformSprites[Platform.PLATFORM_TILE_LOCATIONS[0]].render(Math.floor(x), Math.floor(y));

        // Render support sprites
        for (let i = 0; i < this.numOfSupports; i++) {
            const supportX = Math.floor(x + Platform.SUPPORT_SPRITE_SPAWN_OFFSET) + Platform.PLATFORM_WIDTH / 2 - Platform.SUPPORTS_WIDTH / 2;
            const supportY = Math.floor(y) + Platform.PLATFORM_HEIGHT + i * (Platform.SUPPORTS_HEIGHT - Platform.PLATFORM_HEIGHT);
            this.supportSprites[Platform.SUPPORTS_TILE_LOCATIONS[0]].render(supportX, supportY);
        }

        if (DEBUG) {
            this.hitbox.render(context);
        }
        
    }

    onCollide(entity){
        this.wasCollided = true;
        super.onCollision(entity);
    }

    onConsume(consumer){
        return;
    }

    getRandomNumberOfSupports() {
        const CAVE_HEIGHT = 600;
        // The y-coordinate of the bottom of the platform
        const bottomOfPlatform = this.position.y + Platform.PLATFORM_HEIGHT;
    
        // The space between the bottom of the platform and the ground
        const spaceToFill = CAVE_HEIGHT - bottomOfPlatform;
    
        // Calculate the number of supports needed to fill this space
        const supportsNeeded = Math.ceil(spaceToFill / Platform.SUPPORTS_HEIGHT);
    
        // Ensure at least 1 support is returned and the number of supports does not exceed a maximum limit
        const minSupports = 1;
        const maxSupports = 8;
        return Math.max(minSupports, Math.min(supportsNeeded, maxSupports));
    }
    
}