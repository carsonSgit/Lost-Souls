import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js"
import Boss from "../../entities/Boss";

export default class BossDeathState extends State{
    
    constructor(boss){
        super();
        this.boss = boss;

        this.animation = new Animation(Boss.DEATH_SPRITE_LOCATION, 0.2, 1);
    }
}