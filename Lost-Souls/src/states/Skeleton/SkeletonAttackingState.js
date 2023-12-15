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
            this.skeleton.currentAnimation = this.animation;
            this.skeleton.sprites = this.skeleton.attackingSprites;
        }

        exit(){
            this.skeleton.attackHitbox.set(0, 0, 0, 0);
        }

        update(dt){
            if(this.skeleton.map.collisionLayer.getTile(Math.floor(this.skeleton.position.x /Tile.SIZE) + 2, Math.floor((this.skeleton.position.y + Skeleton.HEIGHT) /Tile.SIZE)+ 3) == null)
            {
                this.skeleton.changeState(EnemyStateName.Falling);
            }
            if(this.skeleton.currentAnimation.isDone()){
                this.skeleton.currentAnimation.refresh();    
                this.skeleton.attackHitbox.set(0, 0, 0, 0);
                this.skeleton.changeState(EnemyStateName.AttackMode);
            }
            if (this.skeleton.currentAnimation.isHalfwayDone()) {
                this.setSwordHitbox();
            }
            else{
                this.skeleton.velocity.x = 0;
            }
        }

        setSwordHitbox(){
            // Includes magic numbers for left side hitbox
            if(this.skeleton.direction === Direction.Left){
                let hitboxX, hitboxY, hitboxWidth, hitboxHeight;
    
                hitboxWidth = this.skeleton.dimensions.x / 12 ;
                hitboxHeight = this.skeleton.dimensions.x / 3;
                hitboxX = this.skeleton.position.x + hitboxWidth + this.skeleton.dimensions.x / 5;
                hitboxY = this.skeleton.position.y + this.skeleton.dimensions.y / 3;
    
                this.skeleton.attackHitbox.set(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
            }
            // Includes magic numbers for Right side hitbox
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