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
        this.eye.hitbox.set(0,0,0,0);

        this.eye.velocity = new Vector(0, 0);
        sounds.play(SoundName.EnemyDeath);
        this.eye.currentAnimation = this.animation;
        this.eye.sprites = this.eye.deathSprites;
        console.log('Eye Death state: enter');
        this.eye.isDead = true;

        if(this.firstCall){
            this.firstCall = false;
            sounds.play(SoundName.Sword_Hit);
            timer.tween(this.eye.position, ['y'], [330], 0.6, ()=> {
                sounds.play(SoundName.Land);
            });
        }
    }


    
    update(dt){
        if(this.eye.currentAnimation.isDone()){
            console.log("Eye is dead");
            this.eye.hitbox.set(0,0,0,0);
            this.eye.isDead = true;
            this.eye.cleanUp = true;
        }
    }

    
}