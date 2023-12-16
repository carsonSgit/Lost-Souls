import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Vector from "../../../lib/Vector.js";
import SoundName from "../../enums/SoundName.js";
import { sounds, timer } from "../../globals.js";

export default class EyeDeathState extends State{
    constructor(eye){
        super();

        this.eye = eye;
        this.firstCall = true;

        this.animation = new Animation([0, 1, 2, 3], 0.3, 1);
    }

    enter(){
        // Remove hitbox
        this.eye.hitbox.set(0,0,0,0);
        // Stop all movement
        this.eye.velocity = new Vector(0, 0);

        // Play death sound
        sounds.play(SoundName.EnemyDeath);

        // Give death animation
        this.eye.currentAnimation = this.animation;
        this.eye.sprites = this.eye.deathSprites;
        // Set death flag
        this.eye.isDead = true;

        if(this.firstCall){
            this.firstCall = false;
            sounds.play(SoundName.Sword_Hit);
            // Tweens so he kersplats on the ground on death
            timer.tween(this.eye.position, ['y'], [330], 0.6, ()=> {
                sounds.play(SoundName.Land);
            });
        }
    }



    update(dt){
        if(this.eye.currentAnimation.isDone()){
            // Eye data should be cleaned up by the map (not sprite)
            this.eye.cleanUp = true;
            // Increment player score
            this.eye.map.player.score += this.eye.scoreValue;
        }
    }

    
}