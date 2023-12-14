import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys, sounds } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Direction from "../../enums/Direction.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerRollingState extends State{
    constructor(player){
        super();

        this.player = player;


        this.animation = new Animation([0, 1, 2, 3, 4, 6, 7, 8, 9], 0.1 , 1);
        console.log(this.animation);
        this.originalHitboxOffsets = this.player.hitboxOffsets;
    }

    enter(){
        sounds.play(SoundName.Slide);
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.rollingSprites;
        console.log(this.player.sprites);
        console.log('rolling state: enter')
        //this.player.hitbox.set()
        this.player.speedScalar = 1;
        this.player.hitboxOffsets = this.player.rollingHitboxOffsets;
    }

    exit(){
        this.player.hitboxOffsets = this.originalHitboxOffsets;
        this.player.attackHitbox.set(0, 0, 0, 0);
    }
    update(){
        if(this.player.currentAnimation.isDone()){
            console.log('uhh')
			this.player.currentAnimation.refresh();    
            if(keys.a || keys.d){
                this.player.changeState(PlayerStateName.Walking);
            }
            else
            {
                this.player.speedScalar = .7;
                this.player.velocity.x = 0;
                this.player.changeState(PlayerStateName.Idle);
            }
        }
        if(this.player.direction === Direction.Left){
            this.player.moveLeft();
        }
        if(this.player.direction === Direction.Right){
            this.player.moveRight();
        }
    }
}