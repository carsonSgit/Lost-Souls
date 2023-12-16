import Hitbox from "../../lib/Hitbox.js";
import Sprite from "../../lib/Sprite.js";
import StateMachine from "../../lib/StateMachine.js";
import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import EnemyStateName from "../enums/EnemyStateName.js";
import ImageName from "../enums/ImageName.js";
import { DEBUG, context, images } from "../globals.js";
import BossIdleSate from "../states/Boss/BossIdleState.js";
import BossSpawnState from "../states/Boss/BossSpawnState.js";
import Enemy from "./Enemy.js";

export default class Boss extends Enemy{

    static WIDTH = 96;
    static HEIGHT = 96;

    static OFFSET_WIDTH = 0;
    static OFFSET_HEIGHT = 0;

    static SPAWN_SPRITE_WIDTH = 74;
    static SPAWN_SPRITE_HEIGHT = 160;

    static SPAWN_SPRITE_LOCATION = [4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5];
    static IDLE_SPRITE_LOCATION = [0, 1, 2, 3, 4, 5];
    static WALKING_SPRITE_LOCATION = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33];
    static ATTACK_SPRITE_LOCATION = [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54 ,55 ,56, 57 , 58];
    static HURT_SPRITE_LOCATION = [66, 67, 68, 69, 70];
    static DEATH_SPRITE_LOCATION = [88, 89, 90, 91, 92, 93, 94, 95, 96, 97 ,98 ,99 ,100 ,101 ,102 ,103 ,104, 105, 106, 107, 108, 109];

    static SPRITE_WIDTH = 288;
    static SPRITE_HEIGHT = 160;

    constructor(dimensions, position, velocityLimit, map){
        super(dimensions, position, velocityLimit);

        this.map = map;
        this.spawning = true;

        this.gravityForce = new Vector(0, 1000);

        this.speedScalar = 0.15;
        this.frictionScalar = 0.1;

        this.direction = Direction.Left;

        this.positionOffset =  new Vector(0, 0);
        this.attackHitbox = new Hitbox(0, 0, 0, 0, 'blue');
        this.hitboxOffsets = new Hitbox(Boss.WIDTH+8, Boss.HEIGHT-8, -Boss.OFFSET_WIDTH + Boss.WIDTH, -Boss.OFFSET_HEIGHT+Boss.HEIGHT);
        //BOSS SPAWN OFFSETS ARE DIFFERNT FROM ALL SPRITES,
        // SO WE NEED OFFSETS FOR THE SPAWN SPRITES
        // look at zelda code
        
        /**
		 * Since the regular sprite and sword-swinging sprite are different dimensions,
		 * we need a position offset to make it look like one smooth animation when rendering.
		* 		this.positionOffset = { x: 0, y: 0 };
        */

        
        this.spawnSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.BossSpawn),
            Boss.SPAWN_SPRITE_WIDTH,
            Boss.SPAWN_SPRITE_HEIGHT,
        );

        this.allSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.Boss),
            Boss.SPRITE_WIDTH,
            Boss.SPRITE_HEIGHT,
        );

        this.sprites = this.allSprites;

        this.strength = 4;

        this.stateMachine = new StateMachine();
        this.stateMachine.add(EnemyStateName.Spawn, new BossSpawnState(this));
        this.stateMachine.add(EnemyStateName.Idle, new BossIdleSate(this));
        this.stateMachine.change(EnemyStateName.Idle);
    }

    update(dt){
        super.update(dt);

        if(this.map.collisionLayer == this.map.bossCollisionLayer && this.spawning){
            this.stateMachine.change(EnemyStateName.Spawn);
            this.spawning = false;
        }
    }

    render(){
        context.save();
        super.render(this.positionOffset);

        context.restore();

        if(DEBUG){
            this.attackHitbox.render(context);
        }
    }
}