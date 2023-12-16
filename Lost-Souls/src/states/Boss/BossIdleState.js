import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Boss from "../../entities/Boss.js";

export default class BossIdleSate extends State{
    constructor(boss){
        super();
        this.boss = boss;

        this.animation = new Animation(Boss.IDLE_SPRITE_LOCATION, 0.2);
    }

    enter(){
        this.boss.currentAnimation = this.animation;
        this.boss.sprites = this.boss.allSprites;
        console.log('Boss idle state: enter');
    }

    exit(){
        console.log('Boss idle state: exit');
    }

    update(dt){
    }
}