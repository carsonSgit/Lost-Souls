import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys } from "../../globals.js";
import Direction from "../../enums/Direction.js";
import PlayerStateName from "../../enums/PlayerStateName.js";

export default class PlayerAttackingState extends State{
    constructor(player){
        super();

        this.player = player;


        this.animation = new Animation([0, 1, 2, 3, 4, 5], 0.1, 1);
    }

    enter(){
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.attackingSprites;
        console.log('Attacking State: enter')
    }

    update(){
        if(this.player.currentAnimation.isDone()){
			this.player.currentAnimation.refresh();
            this.player.changeState(PlayerStateName.Idle);
        }
        if (this.player.currentAnimation.isHalfwayDone()) {
			this.setSwordHitbox();
		}
        else{
            this.player.velocity.x = 0;
        }
    }

    setSwordHitbox(){
        if(this.player.direction === Direction.Left){
            let hitboxX, hitboxY, hitboxWidth, hitboxHeight;

			hitboxWidth = this.player.dimensions.x / 6 ;
			hitboxHeight = this.player.dimensions.x / 3;
			hitboxX = this.player.position.x + hitboxWidth / 2 + 14;
			hitboxY = this.player.position.y + this.player.dimensions.y / 4;
            console.log(hitboxWidth)
            this.player.attackHitbox.set(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
        }
        if(this.player.direction === Direction.Right) {
            let hitboxX, hitboxY, hitboxWidth, hitboxHeight;

			hitboxWidth = this.player.dimensions.x / 6;
			hitboxHeight = this.player.dimensions.x / 3;
			hitboxX = this.player.position.x + this.player.dimensions.x / 1.6;
			hitboxY = this.player.position.y + this.player.dimensions.y / 4;
            console.log(hitboxWidth)
            this.player.attackHitbox.set(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
        }
    }
}