import State from "../../../lib/State.js";
import Animation from "../../../lib/Animation.js";
import { keys } from "../../globals.js";
import PlayerStateName from "../../enums/PlayerStateName.js";

export default class PlayerWalkingState extends State{
    constructor(player){
        super();

        this.player = player;

        this.animation = new Animation([0, 1, 2, 3, 4, 5, 6, 7], 0.1);
    }

    enter(){
        this.player.currentAnimation = this.animation;
        this.player.sprites = this.player.walkingSprites;

    }

    update(dt){
    }
}