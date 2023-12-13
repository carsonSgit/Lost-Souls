import Hitbox from "../../lib/Hitbox.js";
import Sprite from "../../lib/Sprite.js";
import StateMachine from "../../lib/StateMachine.js";
import Direction from "../enums/Direction.js";
import EnemyStateName from "../enums/EnemyStateName.js";
import ImageName from "../enums/ImageName.js";
import { DEBUG, images, context} from "../globals.js";
import SkeletonFallingState from "../states/Skeleton/SkeletonFallingState.js";
import SkeletonIdleState from "../states/Skeleton/SkeletonIdleState.js";
import Enemy from "./Enemy.js";
import Vector from "../../lib/Vector.js";
import Tile from "../../lib/Tile.js";

export default class Skeleton extends Enemy{

    static WIDTH = 48;
    static HEIGHT = 56;

    static SPRITE_WIDTH = 150;
    static SPRITE_HEIGHT = 150;

    static OFFSET_WIDTH = 150;
    static OFFSET_HEIGHT = 150;

    static IDLE_SPRITE_WIDTH = 150;
    static IDLE_SPRITE_HEIGHT = 150;

    static WALKING_SPRITE_WIDTH = 150;
    static WALKING_SPRITE_HEIGHT = 150;

    constructor(dimensions, position, velocityLimit, map){
        super(dimensions, position, velocityLimit);
        
        this.map = map;

        this.gravityForce = new Vector(0, 1000);

        this.direction = Direction.Left;
        this.hitboxOffsets = new Hitbox(Skeleton.WIDTH+8, Skeleton.HEIGHT-8, -Skeleton.OFFSET_WIDTH + Skeleton.WIDTH, -Skeleton.OFFSET_HEIGHT+Skeleton.HEIGHT);

        this.idleSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.SkeletonIdle),
            Skeleton.IDLE_SPRITE_WIDTH,
            Skeleton.IDLE_SPRITE_HEIGHT,
        );
        this.fallingSprites = Sprite.generateSpritesFromSpriteSheet(
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
        
        this.strength = 2;

        this.stateMachine = new StateMachine();
        this.stateMachine.add(EnemyStateName.Idle, new SkeletonIdleState(this));
        this.stateMachine.add(EnemyStateName.Falling, new SkeletonFallingState(this));
        this.stateMachine.change(EnemyStateName.Idle);
    }

    moveDown(dt){
        this.direction = Direction.Down;
        if(this.map.collisionLayer.getTile(Math.floor(this.position.x /Tile.SIZE) + 2, Math.floor((this.position.y+Skeleton.HEIGHT) /Tile.SIZE) +3) != null
        && this.map.collisionLayer.getTile(Math.floor((this.position.x + Skeleton.WIDTH) / Tile.SIZE), Math.floor((this.position.y+Skeleton.HEIGHT)/Tile.SIZE) + 3) !== null) {
            this.velocity.y = 0;
            console.log("hi")
        }
        else{
            this.velocity.add(this.gravityForce, dt);
        }
    }
}