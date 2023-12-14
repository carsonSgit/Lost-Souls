import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js"
import Skeleton from "../../entities/Skeleton.js";
import { keys } from "../../globals.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";
import EnemyStateName from "../../enums/EnemyStateName.js";

export default class SkeletonIdleState extends State{

        constructor(skeleton){
            super();
            this.skeleton = skeleton;

            this.animation = new Animation([0, 1, 2, 3], 0.15);
        }

        enter(){
            this.skeleton.currentAnimation = this.animation;
            this.skeleton.sprites = this.skeleton.idleSprites;
            console.log("skeleton idle state: enter");
        }

        update(dt){
            if(this.skeleton.map.collisionLayer.getTile(Math.floor(this.skeleton.position.x /Tile.SIZE) + 2, Math.floor((this.skeleton.position.y + Skeleton.HEIGHT) /Tile.SIZE)+ 3) == null)
            {
                this.skeleton.changeState(EnemyStateName.Falling);
            }
            this.chase();
        }

        chase(){
            if(this.skeleton.getDistanceBetween(this.skeleton.map.player) <= Skeleton.CHASE_DISTANCE){
                this.skeleton.changeState(EnemyStateName.AttackMode)
            }
        }
}