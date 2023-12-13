import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import Enemy from "./Enemy.js";

export default class Skeleton extends Enemy{

    static WIDTH = 48;
    static HEIGHT = 56;

    static IDLE_SPRITE_WIDTH = 150;
    static IDLE_SPRITE_HEIGHT = 150;

    static WALKING_SPRITE_WIDTH = 150;
    static WALKING_SPRITE_HEIGHT = 150;

    constructor(dimensions, position, velocityLimit, map){
        super(dimensions, position, velocityLimit);
        this.map = map;

        this.idleSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.SkeletonIdle),
            Skeleton.IDLE_SPRITE_WIDTH,
            Skeleton.IDLE_SPRITE_HEIGHT,
        );
        this.walkingSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.SkeletonWalk),
            Skeleton.WALKING_SPRITE_WIDTH,
            Skeleton.WALKING_SPRITE_HEIGHT,
        );

        this.sprites = this.idleSprites;
        
    }
}