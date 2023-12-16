import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys, sounds } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Tile from "../../../lib/Tile.js";
import Player from "../../entities/Player.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayerHurtState extends State{
    constructor(player){
        super();

        this.player = player;

        this.animation = new Animation([0, 1, 2], 0.1, 1);
    }

    enter(){
        // Play hurt sound effect
        sounds.play(SoundName.Hurt)
        
        // Become invulnerable (I-Frames)
        this.player.becomeInvulnerable();

        // Set hurt animation & sprites
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.hurtSprites;
    }

    exit(){
        this.player.attackHitbox.set(0, 0, 0, 0);
    }
    
    update(){
        if(this.player.currentAnimation.isDone()){
			this.player.currentAnimation.refresh();  
            // Was that damage lethal? ...
            if(this.player.isDead){
                this.player.changeState(PlayerStateName.Dying);
            }
            // It wasn't, are we moving? ...
            else if((keys.a || keys.d) || (keys.A || keys.D)){
                this.player.changeState(PlayerStateName.Walking);
            }
            // It wasn't and we aren't moving (Was the attack that shocking?...)
            else{
                this.player.changeState(PlayerStateName.Idle);
            }
        }
        // Are we hit mid-air? ...
        if(this.player.map.collisionLayer.getTile(Math.floor(this.player.position.x /Tile.SIZE) + 2, Math.floor((this.player.position.y + Player.HEIGHT) /Tile.SIZE)+ 1) == null)
        {
            this.player.changeState(PlayerStateName.Falling);
        }

    }
}