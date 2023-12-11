import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Direction from "../../enums/Direction.js";

export default class PlayerRollingState extends State{
    constructor(player){
        super();

        this.player = player;


        this.animation = new Animation([0, 1, 2, 3], 0.1, 3);
        this.originalHitboxOffsets = this.player.hitboxOffsets;
    }

    enter(){
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.rollingSprites;
        console.log('enter')
        //this.player.hitbox.set()

        this.player.hitboxOffsets = this.player.rollingHitboxOffsets;
    }

    update(){
        if(this.player.currentAnimation.isDone()){
			this.player.currentAnimation.refresh();    
            this.player.velocity.x = 0;
            this.player.hitboxOffsets = this.originalHitboxOffsets;
            this.player.changeState(PlayerStateName.Idle);
        }
        if(this.player.direction === Direction.Left){
            this.player.moveLeft();
        }
        if(this.player.direction === Direction.Right){
            this.player.moveRight();
        }
    }
}