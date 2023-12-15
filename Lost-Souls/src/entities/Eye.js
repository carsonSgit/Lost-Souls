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
import Enemy from "./Enemy.js";

export default class Eye extends Enemy{

    static OFFSET_WIDTH = 150;
    static OFFSET_HEIGHT = 150;

    static FLIGHT_SPRITE_WIDTH = 150;
    static FLIGHT_SPRITE_HEIGHT = 150;

    static ATTACK_SPRITE_WIDTH = 150;
    static ATTACK_SPRITE_HEIGHT = 150;

    static DEATH_SPRITE_WIDTH = 150;
    static DEATH_SPRITE_HEIGHT = 150;

    static WIDTH = 48;
    static HEIGHT = 40;


    static CHASE_DISTANCE = 2.5 * Eye.WIDTH;


    constructor(dimensions, position, velocityLimit, map){
        super(dimensions, position, velocityLimit);

        this.map = map;

        this.gravityForce = new Vector(0, 1000);

        this.speedScalar = 0.60;
        this.frictionScalar = 0.05;
        this.flapAmplitude = 5;
        this.flapFrequency = 3; 
        this.flapTimer = 0;

        this.direction = Direction.Left;

        this.positionOffset =  new Vector(0, 0);

        this.hitboxOffsets = new Hitbox(Eye.WIDTH+4,Eye.HEIGHT+14,-Eye.OFFSET_WIDTH + Eye.WIDTH-4, -Eye.OFFSET_HEIGHT+Eye.HEIGHT)


        this.idleSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.EyeFlight),
            Eye.FLIGHT_SPRITE_WIDTH,
            Eye.FLIGHT_SPRITE_HEIGHT,
        );

        this.attackSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.EyeAttack),
            Eye.ATTACK_SPRITE_WIDTH,
            Eye.ATTACK_SPRITE_HEIGHT,
        );

        this.deathSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.EyeDeath),
            Eye.DEATH_SPRITE_WIDTH,
            Eye.DEATH_SPRITE_HEIGHT,
        );

        this.sprites = this.idleSprites;

        this.strength = 1;

        this.stateMachine = new StateMachine();
        this.stateMachine.add(EnemyStateName.Idle, new EyeIdleState(this));
        this.stateMachine.add(EnemyStateName.AttackMode, new EyeAttackModeState(this));
        this.stateMachine.add(EnemyStateName.Attacking, new EyeAttackingState(this));
        this.stateMachine.add(EnemyStateName.Death, new EyeDeathState(this));
        this.stateMachine.change(EnemyStateName.Idle);
            
    }

    render(){
        context.save();

        super.render(this.positionOffset);
    
        context.restore();

        

        
    }

    moveLeft(dt) {
        this.direction = Direction.Left;
        this.velocity.x = Math.max(this.velocity.x - this.speedScalar * this.frictionScalar, -this.velocityLimit.x);
        this.flap(dt);

        
    }

    moveRight(dt) {
        this.direction = Direction.Right;
        this.velocity.x = Math.min(this.velocity.x + this.speedScalar * this.frictionScalar, this.velocityLimit.x);
        this.flap(dt);

        
    }

    flap(dt) {
        this.flapTimer += dt;
        if(this.stateMachine.currentState.name === EnemyStateName.AttackMode){
            this.velocity.y = this.flapAmplitude * Math.sin(this.flapFrequency * this.flapTimer);
        }
    }

    receiveDamage(damage){
        super.receiveDamage(damage);
    
        sounds.play(SoundName.Sword_Hit)
        this.isDead = true;
        this.changeState(EnemyStateName.Death);
    
        
    }
}