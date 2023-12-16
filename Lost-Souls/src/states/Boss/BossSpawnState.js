import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Boss from "../../entities/Boss.js";
import EnemyStateName from "../../enums/EnemyStateName.js";

export default class BossSpawnState extends State{
    constructor(boss){
        super();
        this.boss = boss;

        this.animation = new Animation(Boss.SPAWN_SPRITE_LOCATION, 0.1, 1);
    }

    enter(){
        this.boss.currentAnimation = this.animation;
        this.boss.sprites = this.boss.spawnSprites;
        this.boss.currentAnimation.refresh();
        console.log('Boss spawning state: enter');
    }

    exit(){
        console.log('Boss spawning state: exit');
    }

    update(dt){
        if(this.boss.currentAnimation.isDone()){
            this.boss.changeState(EnemyStateName.Idle);
        }
    }
}