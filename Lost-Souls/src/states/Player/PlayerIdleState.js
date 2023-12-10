import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";

export default class PlayerIdleState extends State{
    constructor(player){
        super();

        this.player = player;

        this.animation = new Animation([0, 1, 2, 3, 4, 5], 1);
    }

    enter(){
        this.player.currentAnimation = this.animation;
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