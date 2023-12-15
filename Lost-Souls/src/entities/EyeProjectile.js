import Hitbox from "../../lib/Hitbox.js";
import Sprite from "../../lib/Sprite.js";
import StateMachine from "../../lib/StateMachine.js";
import Tile from "../../lib/Tile.js";
import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import EnemyStateName from "../enums/EnemyStateName.js";
import ImageName from "../enums/ImageName.js";
import SoundName from "../enums/SoundName.js";
import { DEBUG, context, images, sounds } from "../globals.js";
import EyeAttackModeState from "../states/Eye/EyeAttackModeState.js";
import EyeAttackingState from "../states/Eye/EyeAttackingState.js";
import EyeDeathState from "../states/Eye/EyeDeathState.js";
import EyeIdleState from "../states/Eye/EyeIdleState.js";
import EyeProjectileState from "../states/Eye/EyeProjectileState.js";
import Enemy from "./Enemy.js";

export default class EyeProjectile extends Enemy{
    static WIDTH = Tile.SIZE;
    static HEIGHT = Tile.SIZE;

    static SPRITE_PROJECTILE_WIDTH = 48;
    static SPRITE_PROJECTILE_HEIGHT = 48;

    constructor(dimensions, position, velocityLimit, map, direction){
        super(dimensions, position, velocityLimit);

        this.map = map;

        this.direction = direction;

        this.speedScalar = 0.60;
        this.frictionScalar = 0.05;

        this.positionOffset =  new Vector(0, 0);

        this.hitboxOffsets = new Hitbox(EyeProjectile.WIDTH,EyeProjectile.HEIGHT,-EyeProjectile.WIDTH + EyeProjectile.SPRITE_PROJECTILE_WIDTH, -EyeProjectile.HEIGHT + EyeProjectile.SPRITE_PROJECTILE_HEIGHT);

        this.projectileSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.EyeProjectile),
            EyeProjectile.SPRITE_PROJECTILE_WIDTH,
            EyeProjectile.SPRITE_PROJECTILE_HEIGHT,
        );

        
        this.sprites = this.projectileSprites;

        this.strength = 3;

        this.stateMachine = new StateMachine();
        this.stateMachine.add(EnemyStateName.Projectile, new EyeProjectileState(this));
        this.stateMachine.change(EnemyStateName.Projectile);
    }

    render(){
        context.save();

        super.render(this.positionOffset);
    
        context.restore(); 
    }

    moveLeft(dt) {
        this.direction = Direction.Left;
        this.velocity.x = Math.max(this.velocity.x - this.speedScalar * this.frictionScalar, -this.velocityLimit.x);
    }

    moveRight(dt) {
        this.direction = Direction.Right;
        this.velocity.x = Math.min(this.velocity.x + this.speedScalar * this.frictionScalar, this.velocityLimit.x);
    }
}