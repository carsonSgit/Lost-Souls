

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
        // Play death sound effect
        sounds.play(SoundName.EnemyDeath);
        // Set skeleton death animation & sprites
        this.skeleton.currentAnimation = this.animation;
        this.skeleton.sprites = this.skeleton.deathSprites;

        // Stop skeleton movement
        this.skeleton.velocity.x = 0;
    }

    exit(){
        this.skeleton.attackHitbox.set(0, 0, 0, 0);
    }

    update(dt){
        // If death animation is done ...
        if(this.skeleton.currentAnimation.isDone()){
            // Set hitbox to Zero
            this.skeleton.hitbox.set(0,0,0,0);
            this.skeleton.cleanUp = true;
            // Add score to player
            this.skeleton.map.player.score += this.skeleton.scoreValue;
        }
    }
}