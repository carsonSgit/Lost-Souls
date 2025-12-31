import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Boss from "../../entities/Boss.js";
import EnemyStateName from "../../enums/EnemyStateName.js";

export default class BossHurtState extends State{

    constructor(boss){
        super();

        this.boss = boss;

        this.animation = new Animation(Boss.HURT_SPRITE_LOCATION, 0.1, 1);
    }

    enter(){
        this.boss.currentAnimation = this.animation;
        this.boss.sprites = this.boss.allSprites;

        this.boss.velocity.x = 0;
    }

    exit(){
        this.boss.attackHitbox.set(0, 0, 0, 0);
    }

    update(dt){
        if(this.boss.currentAnimation.isDone()){
            this.boss.currentAnimation.refresh();

            // Did the damage kill the boss? If so, go to Death state
            if(this.boss.isDead){
                this.boss.changeState(EnemyStateName.Death);
            }
            // It didn't kill the boss, go back to Idle state
            else{
                this.boss.changeState(EnemyStateName.Idle);
            }
        }
    }
}