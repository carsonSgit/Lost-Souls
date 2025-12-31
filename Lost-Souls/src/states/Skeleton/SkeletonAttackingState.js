import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js"
import Skeleton from "../../entities/Skeleton.js";
import { keys } from "../../globals.js";
import Tile from "../../../lib/Tile.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Direction from "../../enums/Direction.js";

export default class SkeletonAttackingState extends State{

    constructor(skeleton){
        super();
        this.skeleton = skeleton;

        this.animation = new Animation([0, 1, 2, 3, 4, 5, 6, 7], 0.2, 1);
    }

    enter(){
        // Set skeleton animation & sprites
        this.skeleton.currentAnimation = this.animation;
        this.skeleton.sprites = this.skeleton.attackingSprites;

        // Always refresh animation to start from frame 0
        // This prevents instant attacks when returning to this state after being hurt
        this.animation.refresh();
    }

    exit(){
        // Reset attack hitbox
        this.skeleton.attackHitbox.set(0, 0, 0, 0);
    }

    update(dt){
        // Is skeleton colliding with the floor? If not, change state to falling
        if(this.skeleton.map.collisionLayer.getTile(Math.floor(this.skeleton.position.x /Tile.SIZE) + 2, Math.floor((this.skeleton.position.y + Skeleton.HEIGHT) /Tile.SIZE)+ 3) == null){
            this.skeleton.changeState(EnemyStateName.Falling);
        }
        // Is animation done? If so, reset attack hitbox & change state to attack mode
        if(this.skeleton.currentAnimation.isDone()){
            this.skeleton.currentAnimation.refresh();    
            this.skeleton.attackHitbox.set(0, 0, 0, 0);
            this.skeleton.changeState(EnemyStateName.AttackMode);
        }
        // Is skeleton halfway through animation? If so, set attack hitbox
        if (this.skeleton.currentAnimation.isHalfwayDone()) {
            this.setSwordHitbox();
        }
        else{
            this.skeleton.velocity.x = 0;
        }
    }

    /**
     * Sets the sword hitbox based on the skeleton's direction
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
        if(this.skeleton.direction === Direction.Left){
            let hitboxX, hitboxY, hitboxWidth, hitboxHeight;

            hitboxWidth = this.skeleton.dimensions.x / 12 ;
            hitboxHeight = this.skeleton.dimensions.x / 3;
            hitboxX = this.skeleton.position.x + hitboxWidth + this.skeleton.dimensions.x / 5;
            hitboxY = this.skeleton.position.y + this.skeleton.dimensions.y / 3;

            this.skeleton.attackHitbox.set(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
        }

        // Right side hitbox
        if(this.skeleton.direction === Direction.Right) {
            let hitboxX, hitboxY, hitboxWidth, hitboxHeight;

            hitboxWidth = this.skeleton.dimensions.x / 12;
            hitboxHeight = this.skeleton.dimensions.x / 3;
            hitboxX = this.skeleton.position.x + this.skeleton.dimensions.x / 1.45;
            hitboxY = this.skeleton.position.y + this.skeleton.dimensions.y / 3;

            this.skeleton.attackHitbox.set(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
        }
    }
}