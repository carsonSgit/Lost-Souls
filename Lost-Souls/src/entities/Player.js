import Sprite from "../../lib/Sprite.js";
import StateMachine from "../../lib/StateMachine";
import ImageName from "../enums/ImageName";
import { DEBUG, images } from "../globals.js";
import GameEntity from "./GameEntity.js"
import PlayerStateName from "../enums/PlayerStateName.js";

export default class Player extends GameEntity{

    static WALKING_SPRITE_WIDTH = 128;
    static WALKING_SPRITE_HEIGHT = 64;
    static IDLE_SPRITE_WIDTH = 128;
    static IDLE_SPRITE_HEIGHT = 64;
    
    constructor(dimensions, position, velocityLimit){
        super(dimensions, position, velocityLimit);

        this.idleSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.PlayerIdle),
            Player.IDLE_SPRITE_WIDTH,
            Player.IDLE_SPRITE_HEIGHT,
        );
        this.walkingSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.PlayerWalk),
            Player.WALKING_SPRITE_WIDTH,
            Player.WALKING_SPRITE_HEIGHT,
        );

        this.sprites = this.walkingSprites;

        this.stateMachine = this.initializeStateMachine();
        
    }

    render(){
        context.save();

        super.render(this.positionOffset);

        context.restore();
    }

    initializeStateMachine(){
        const stateMachine = new StateMachine();

        stateMachine.add(PlayerStateName.Idle, new PlayerWalkingState(this));
        stateMachine.add(PlayerStateName.Walking, new PlayerWalkingState(this));

        this.changeState(PlayerStateName.Idle);

        return stateMachine;
    }
}