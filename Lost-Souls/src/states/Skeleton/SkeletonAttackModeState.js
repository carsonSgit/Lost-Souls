import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js"
import Skeleton from "../../entities/Skeleton.js";
import { keys } from "../../globals.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Direction from "../../enums/Direction.js";

export default class SkeletonAttackModeState extends State{

        constructor(skeleton){
            super();
            this.skeleton = skeleton;

            this.animation = new Animation([0, 1, 2, 3], 0.2);
        }

        enter(){
            this.skeleton.currentAnimation = this.animation;
            this.skeleton.sprites = this.skeleton.walkingSprites;
            
            this.skeleton.attackHitbox.set(0, 0, 0, 0);
        }

        
        exit(){
            this.skeleton.attackHitbox.set(0, 0, 0, 0);
        }

        update(dt){
            if(this.skeleton.map.collisionLayer.getTile(Math.floor(this.skeleton.position.x /Tile.SIZE) + 2, Math.floor((this.skeleton.position.y + Skeleton.HEIGHT) /Tile.SIZE)+ 3) == null)
            {
                this.skeleton.changeState(EnemyStateName.Falling);
            }
            this.decideDirection();
            this.move();
        }

        decideDirection() {
            if(this.skeleton.map.collisionLayer.getTile(Math.floor(this.skeleton.position.x /Tile.SIZE) + 2, Math.floor((this.skeleton.position.y + Skeleton.HEIGHT) /Tile.SIZE)+ 3) == null)
            {
                this.skeleton.changeState(EnemyStateName.Falling);
            }

            else if (this.skeleton.getDistanceBetween(this.skeleton.map.player) < (Skeleton.CHASE_DISTANCE - 35)) {
                this.skeleton.changeState(EnemyStateName.Attacking);
            }
            else if (this.skeleton.map.player.position.x < this.skeleton.position.x) {
                this.skeleton.direction = Direction.Left;
            }
            else {
                this.skeleton.direction = Direction.Right;
            }
        }

        move(dt) {
            if (this.skeleton.direction === Direction.Left) {
                this.skeleton.moveLeft();
            }
            else if (this.skeleton.direction === Direction.Right) {
                this.skeleton.moveRight();
            }
        }
}