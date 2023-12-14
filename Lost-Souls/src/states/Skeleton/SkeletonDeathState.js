

import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js"
import Skeleton from "../../entities/Skeleton.js";
import { keys, sounds } from "../../globals.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import Direction from "../../enums/Direction.js";
import SoundName from "../../enums/SoundName.js";

export default class SkeletonDeathState extends State{

    constructor(skeleton){
        super();
        this.skeleton = skeleton;

        this.animation = new Animation([0, 1, 2, 3], 0.2, 1);
    }

    enter(){
        sounds.play(SoundName.EnemyDeath);
        this.skeleton.currentAnimation = this.animation;
        this.skeleton.sprites = this.skeleton.deathSprites;
        console.log('Skeleton Death state: enter')
        this.skeleton.velocity.x = 0;
    }


    update(dt){
        if(this.skeleton.currentAnimation.isDone()){
            this.skeleton.hitbox.set(0,0,0,0);
            this.skeleton.isDead = true;
            this.skeleton.cleanUp = true;
        }
    }
}