import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Eye from "../../entities/Eye.js";
import Direction from "../../enums/Direction.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import SoundName from "../../enums/SoundName.js";
import { sounds, timer } from "../../globals.js";

export default class EyeProjectileState extends State{
    
    constructor(projectile, direction){
        super();
        this.projectile = projectile;

        if(direction === Direction.Left){
            this.projectile.velocity.x = -75;
        }
        else if(direction === Direction.Right){
            this.projectile.velocity.x = 75;
        }
        
        this.animation = new Animation([0, 1, 2, 3, 4, 5, 6, 7], 0.06);
    }

    enter(){
        this.projectile.currentAnimation = this.animation;
        this.projectile.sprites = this.projectile.projectileSprites;
        console.log("Eye projectile state: enter");

        timer.tween(this.projectile.position, ['x','y'], [this.projectile.map.player.position.x, this.projectile.map.player.position.y], 0.6, ()=> {
            sounds.play(SoundName.Land);
        });
    }

    update(dt){
        if(this.projectile.currentAnimation.isDone()){
            this.projectile.cleanUp = true;
            
            console.log(this.projectile);
        }
    }
}