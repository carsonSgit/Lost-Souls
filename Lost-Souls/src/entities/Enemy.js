import GameEntity from "./GameEntity.js";

export default class Enemy extends GameEntity{
    //for now no added functionality but will be used for enemy specific stuff
    constructor(dimensions, position, velocityLimit){
        super(dimensions, position, velocityLimit);

        // Default score value of an enemy
        this.scoreValue = 5;
    }

}