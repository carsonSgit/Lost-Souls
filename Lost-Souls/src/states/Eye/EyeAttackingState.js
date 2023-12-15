import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import EnemyStateName from "../../enums/EnemyStateName.js";

export default class EyeAttackingState extends State{

    constructor(eye){
        super();
        this.eye = eye;

        this.animation = new Animation([0, 1, 2, 3, 4, 5], 0.2, 1);
    }

    enter(){
        this.eye.velocity.x = 0;
        this.eye.velocity.y = 0;
        this.eye.currentAnimation = this.animation;
        this.eye.sprites = this.eye.attackSprites;
    }

    exit(){
        //console.log("eye Attacking State: Exit");
    }

    update(dt){
        
        if(this.eye.currentAnimation.isDone()){
            // 1 in 3 chance if eye does not have a projectile shot yet 
            if(Math.floor(Math.random() * 3) + 1 === 1 && this.eye.projectile == null){
                this.eye.shootProjectile();
            }

            this.eye.currentAnimation.refresh();    
            this.eye.changeState(EnemyStateName.AttackMode);
        }
    }
}