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

        this.positionOffset =  new Vector(0, 0 );

        this.hitboxOffsets = new Hitbox((EyeProjectile.WIDTH) - EyeProjectile.WIDTH * 2, EyeProjectile.HEIGHT - (EyeProjectile.HEIGHT / 4),
                                        -EyeProjectile.HEIGHT + (EyeProjectile.SPRITE_PROJECTILE_WIDTH / 2), -EyeProjectile.HEIGHT + EyeProjectile.SPRITE_PROJECTILE_HEIGHT / 2);

        // Sprites
        this.projectileSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.EyeProjectile),
            EyeProjectile.SPRITE_PROJECTILE_WIDTH,
            EyeProjectile.SPRITE_PROJECTILE_HEIGHT,
        );

        
        this.sprites = this.projectileSprites;

        this.strength = 3;
        this.isDead = false;

        // States
        this.stateMachine = new StateMachine();
        this.stateMachine.add(EnemyStateName.Projectile, new EyeProjectileState(this));
        this.stateMachine.change(EnemyStateName.Projectile);
    }

    render(){
        context.save();

        // Hitbox tracks tweening position
        if(!this.isDead){
            this.hitbox.set(
                this.position.x + this.hitboxOffsets.position.x,
                this.position.y + this.hitboxOffsets.position.y,
                this.dimensions.x + this.hitboxOffsets.dimensions.x,
                this.dimensions.y + this.hitboxOffsets.dimensions.y,
            );
            super.render(this.positionOffset);
        }
    
        context.restore(); 
    }


    update(dt){
        super.update(dt);

        // Force update animation
        this.currentAnimation.update(dt);
    }

    receiveDamage(damage){
        // Can kill projectile
        super.receiveDamage(damage);
    
        sounds.play(SoundName.Sword_Hit)
    }
}