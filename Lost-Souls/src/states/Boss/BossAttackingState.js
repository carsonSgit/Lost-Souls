import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Tile from "../../../lib/Tile.js";
import Boss from "../../entities/Boss.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";

export default class BossAttackingState extends State{

    constructor(boss){
        super();
        this.boss = boss;

        this.animation = new Animation(Boss.ATTACK_SPRITE_LOCATION, 0.2, 1);
    }

    enter(){
        this.boss.attackHitbox.set(0, 0, 0, 0);

        this.boss.currentAnimation = this.animation;
        this.boss.sprites = this.boss.allSprites;
    }

    exit(){
        this.boss.attackHitbox.set(0, 0, 0, 0);
    }

    update(dt){
        // Is animation done? If so, reset attack hitbox & change state to attack mode
        if(this.boss.currentAnimation.isDone()){
            this.boss.currentAnimation.refresh();    
            this.boss.attackHitbox.set(0, 0, 0, 0);
            this.boss.changeState(EnemyStateName.AttackMode);
        }
        // Is boss halfway through animation? If so, set attack hitbox
        if (this.boss.currentAnimation.isHalfwayDone()) {
            this.setSwordHitbox();
        }
        else{
            this.boss.velocity.x = 0;
        }
    }

    /**
     * Sets the sword hitbox based on the boss's direction
     * 
     * Inspired by Vikram Singh's Zelda code
     * @see https://github.com/JAC-CS-Game-Programming-F23/4-Zelda/blob/main/src/Zelda-5/src/states/entity/player/PlayerSwordSwingingState.js 
     */
    setSwordHitbox(){
        /*
        * The sword hitbox is set using many magic numbers....
        *
        * So miserable to get right...
        */
        
        // Left side hitbox
        if(this.boss.direction === Direction.Left){
            let hitboxX, hitboxY, hitboxWidth, hitboxHeight;

            hitboxWidth = this.boss.dimensions.x /4;
            hitboxHeight = this.boss.dimensions.x /3;
            hitboxX = this.boss.position.x - Boss.SPRITE_WIDTH + Tile.SIZE * 1.5;
            hitboxY = this.boss.position.y + Boss.HEIGHT - Tile.SIZE *2;


            this.boss.attackHitbox.set(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
        }else if(this.boss.direction === Direction.Right) {// Right side hitbox
            let hitboxX, hitboxY, hitboxWidth, hitboxHeight;

            hitboxWidth = this.boss.dimensions.x / 4;
            hitboxHeight = this.boss.dimensions.x / 3;
            hitboxX = this.boss.position.x - Boss.WIDTH;
            hitboxY = this.boss.position.y + Boss.HEIGHT - Tile.SIZE *2;

            this.boss.attackHitbox.set(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
        }

        
    }
}