import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import PlayerStateName from "../../enums/PlayerStateName.js";

export default class PlayerPrayingState extends State{
    constructor(player){
        super();

        this.player = player;

        this.animation = new Animation([4, 5, 6, 7, 8, 9], 0.1);
        this.standingUpAnimation = new Animation([8, 9, 1, 10, 0, 11], 0.15, 1);
        this.isEnding = false;
    }

    enter(){
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.prayingSprites;
        console.log('Pray State: enter');
        
    }

    stopPraying(){
        this.player.currentAnimation = this.standingUpAnimation;
        this.player.currentAnimation.refresh();
        this.isEnding = true;
    }

    update(){
        if(this.isEnding && this.player.currentAnimation.isDone()){
            this.player.changeState(PlayerStateName.Idle);
        }

    }
}