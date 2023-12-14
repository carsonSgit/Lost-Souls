import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys, sounds } from "../../globals.js";
import Direction from "../../enums/Direction.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerHealState extends State{
    constructor(player){
        super();

        this.player = player;


        this.animation = new Animation([0, 1, 2, 3, 4, 5, 6, 7], 0.1, 1);
    }

    enter(){
        sounds.play(SoundName.Heal)
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.healSprites;
        console.log('Heal State: enter')
    }

    update(){
        if(this.player.currentAnimation.isDone()){  
            this.player.currentAnimation.refresh();
            this.player.changeState(PlayerStateName.Idle);
        }
        if (this.player.currentAnimation.isHalfwayDone()) {
			this.player.currentHealth += 5;
		}
    }
}