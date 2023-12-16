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
        // Play healing sound effect
        sounds.play(SoundName.Heal)
        // Healing animation & sprites
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.healSprites;
    }

    exit(){
        this.player.attackHitbox.set(0, 0, 0, 0);
    }
    
    update(){
        if(this.player.currentAnimation.isDone()){  
            this.player.currentAnimation.refresh();

            // Heal player
			this.player.currentHealth += 5;     

            // Player cannot heal past max health
            this.player.currentHealth = Math.min(this.player.currentHealth, this.player.maxHealth);

            this.player.changeState(PlayerStateName.Idle);
        }
    }
}