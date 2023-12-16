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
        // Set praying animation & sprites
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.prayingSprites;
    }

    stopPraying(){
        // Change to standing up animation
        this.player.currentAnimation = this.standingUpAnimation;
        this.player.currentAnimation.refresh();
        this.isEnding = true;
    }

    update(){
        // When we are stood up, change to idle state
        if(this.isEnding && this.player.currentAnimation.isDone()){
            this.player.changeState(PlayerStateName.Idle);
        }
    }
}