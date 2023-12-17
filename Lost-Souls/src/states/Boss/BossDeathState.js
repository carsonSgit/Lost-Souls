import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js"
import Boss from "../../entities/Boss.js";
import GameStateName from "../../enums/GameStateName.js";
import SoundName from "../../enums/SoundName.js";
import { sounds, stateMachine } from "../../globals.js";

export default class BossDeathState extends State{
    
    constructor(boss){
        super();
        this.boss = boss;
        this.boss.totalHealth = 500;
        this.boss.currentHealth = 500;

        this.animation = new Animation(Boss.DEATH_SPRITE_LOCATION, 0.2, 1);
    }

    enter(){
        sounds.play(SoundName.EnemyDeath);

        this.boss.currentAnimation = this.animation;
        this.boss.sprites = this.boss.allSprites;

        this.boss.velocity.x = 0;
    }

    exit(){
        this.boss.attackHitbox.set(0, 0, 0, 0);
    }

    update(dt){
        if(this.boss.currentAnimation.isDone()){
            this.boss.attackHitbox.set(0, 0, 0, 0);
            this.boss.hitbox.set(0, 0, 0, 0);

            this.boss.cleanUp = true;
        
            this.boss.map.player.score += this.boss.scoreValue;
            stateMachine.change(GameStateName.Victory,
                {
                    map: this.boss.map
                });
        }
    }
}