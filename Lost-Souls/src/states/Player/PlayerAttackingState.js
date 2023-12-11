import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";

export default class PlayerAttackingState extends State{
    constructor(player){
        super();

        this.player = player;


        this.animation = new Animation([0, 1, 2, 3, 4, 5], 0.1);
    }

    enter(){
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.idleSprites;
        console.log('enter')
    }

    update(){
        if (keys.a || keys.d) {
			this.player.changeState(PlayerStateName.Walking);

		}
        if (keys.w) {
			this.player.changeState(PlayerStateName.Jumping);
		}
    }
}