import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Tile from "../../../lib/Tile.js";
import Vector from "../../../lib/Vector.js";
import Boss from "../../entities/Boss.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import SoundName from "../../enums/SoundName.js";
import { sounds } from "../../globals.js";

export default class BossSpawnState extends State{
    constructor(boss){
        super();
        this.boss = boss;

        this.animation = new Animation(Boss.SPAWN_SPRITE_LOCATION, 0.1, 1);
    }

    enter(){
        this.boss.positionOffset = new Vector(Boss.SPAWN_OFFSET_WIDTH, 0);
        sounds.play(SoundName.Fire);
        this.boss.currentAnimation = this.animation;
        this.boss.sprites = this.boss.spawnSprites;
        this.boss.currentAnimation.refresh();
        console.log('Boss spawning state: enter');
    }

    exit(){
        this.boss.positionOffset =  new Vector(-Boss.SPRITE_WIDTH,0);


        console.log('Boss spawning state: exit');
    }

    update(dt){
        if(this.boss.currentAnimation.isDone()){
            sounds.play(SoundName.Fire);
            sounds.stop(SoundName.Fire);
            this.boss.changeState(EnemyStateName.Idle);
        }
    }
}