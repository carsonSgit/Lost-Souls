import Hitbox from "../../lib/Hitbox.js";
import Sprite from "../../lib/Sprite.js";
import StateMachine from "../../lib/StateMachine.js";
import Direction from "../enums/Direction.js";
import EnemyStateName from "../enums/EnemyStateName.js";
import ImageName from "../enums/ImageName.js";
import { DEBUG, images, context, timer, sounds} from "../globals.js";
import SkeletonFallingState from "../states/Skeleton/SkeletonFallingState.js";
import SkeletonIdleState from "../states/Skeleton/SkeletonIdleState.js";
import Enemy from "./Enemy.js";
import Vector from "../../lib/Vector.js";
import Tile from "../../lib/Tile.js";
import SkeletonAttackModeState from "../states/Skeleton/SkeletonAttackModeState.js";
import SkeletonAttackingState from "../states/Skeleton/SkeletonAttackingState.js";
import SkeletonHurtState from "../states/Skeleton/SkeletonHurtState.js";
import SkeletonDeathState from "../states/Skeleton/SkeletonDeathState.js";
import SoundName from "../enums/SoundName.js";

export default class Skeleton extends Enemy{

    static WIDTH = 48;
    static HEIGHT = 56;

    static SPRITE_WIDTH = 150;
    static SPRITE_HEIGHT = 150;

    static OFFSET_WIDTH = 150;
    static OFFSET_HEIGHT = 150;

    static IDLE_SPRITE_WIDTH = 150;
    static IDLE_SPRITE_HEIGHT = 150;

    static FALLING_SPRITE_WIDTH = 150;
    static FALLING_SPRITE_HEIGHT = 150;

    static WALKING_SPRITE_WIDTH = 150;
    static WALKING_SPRITE_HEIGHT = 150;

    static ATTACKING_SPRITE_WIDTH = 150;
    static ATTACKING_SPRITE_HEIGHT = 150;

    static HURT_SPRITE_WIDTH = 150;
    static HURT_SPRITE_HEIGHT = 150;

    static DEATH_SPRITE_WIDTH = 150;
    static DEATH_SPRITE_HEIGHT = 150;

    static CHASE_DISTANCE = 2 * Skeleton.WIDTH;

    static INVULNERABILITY_INTERVAL = 0.1;
    static INVULNERABILITY_DURATION = 0.5;

    constructor(dimensions, position, velocityLimit, map){
        super(dimensions, position, velocityLimit);
        
        this.map = map;

        this.gravityForce = new Vector(0, 1000);
        
        this.speedScalar = 0.15;
        this.frictionScalar = 0.1;

        this.direction = Direction.Left;

        this.positionOffset =  new Vector(0, 3);
        this.attackHitbox = new Hitbox(0, 0, 0, 0, 'blue');
        this.hitboxOffsets = new Hitbox(Skeleton.WIDTH+8, Skeleton.HEIGHT-8, -Skeleton.OFFSET_WIDTH + Skeleton.WIDTH, -Skeleton.OFFSET_HEIGHT+Skeleton.HEIGHT);

        this.idleSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.SkeletonIdle),
            Skeleton.IDLE_SPRITE_WIDTH,
            Skeleton.IDLE_SPRITE_HEIGHT,
        );
        this.fallingSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.SkeletonIdle),
            Skeleton.FALLING_SPRITE_WIDTH,
            Skeleton.FALLING_SPRITE_HEIGHT,
        );
        this.walkingSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.SkeletonWalk),
            Skeleton.WALKING_SPRITE_WIDTH,
            Skeleton.WALKING_SPRITE_HEIGHT,
        );
        this.attackingSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.SkeletonAttack),
            Skeleton.ATTACKING_SPRITE_WIDTH,
            Skeleton.ATTACKING_SPRITE_HEIGHT,
        );
        this.hurtSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.SkeletonHurt),
            Skeleton.ATTACKING_SPRITE_WIDTH,
            Skeleton.ATTACKING_SPRITE_HEIGHT,
        );
        this.deathSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.SkeletonDeath),
            Skeleton.ATTACKING_SPRITE_WIDTH,
            Skeleton.ATTACKING_SPRITE_HEIGHT,
        );

        this.sprites = this.idleSprites;
        
        this.strength = 2;
        this.scoreValue = this.scoreValue;

        this.stateMachine = new StateMachine();
        this.stateMachine.add(EnemyStateName.Idle, new SkeletonIdleState(this));
        this.stateMachine.add(EnemyStateName.Falling, new SkeletonFallingState(this));
        this.stateMachine.add(EnemyStateName.AttackMode, new SkeletonAttackModeState(this));
        this.stateMachine.add(EnemyStateName.Attacking, new SkeletonAttackingState(this));
        this.stateMachine.add(EnemyStateName.Hurt, new SkeletonHurtState(this));
        this.stateMachine.add(EnemyStateName.Death, new SkeletonDeathState(this));
        this.stateMachine.change(EnemyStateName.Idle);
    }

    render(){
        context.save();
        super.render(this.positionOffset);
        
        context.restore();

        if(DEBUG){
            this.attackHitbox.render(context);
        }
    }

    receiveDamage(damage){
        super.receiveDamage(damage);
        //console.log(this.isDead);
        if(!this.isDead){
            sounds.play(SoundName.Sword_Hit)
           // console.log("Entering Skeleton Hurt State")
            this.changeState(EnemyStateName.Hurt);
        }else if(!this.cleanUp){
            this.changeState(EnemyStateName.Death);
            //this.map.player.score += this.scoreValue;
        }
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

    moveLeft() {
		this.direction = Direction.Left;
		this.velocity.x = Math.max(this.velocity.x - this.speedScalar * this.frictionScalar, -this.velocityLimit.x);

        if(this.map.collisionLayer.getTile(Math.ceil(this.position.x /Tile.SIZE) + 2, Math.ceil(this.position.y /Tile.SIZE)) !== null) {
            this.velocity.x = 0;
        }
	}

    moveRight() {
		this.direction = Direction.Right;
		this.velocity.x = Math.min(this.velocity.x + this.speedScalar * this.frictionScalar, this.velocityLimit.x);

        if(this.map.collisionLayer.getTile(Math.ceil((this.position.x + Skeleton.WIDTH) / Tile.SIZE) + 2, Math.ceil(this.position.y /Tile.SIZE)) !== null) {
            this.velocity.x = 0;
        }
    }
}