import GameObject from "./GameObject.js";

export default class Platform extends GameObject{
    constructor(dimensions, position){
        super(dimensions, position);
        this.isSolid = true;
        this.isCollidable = true;
        this.isConsumable = false;
        this.wasCollided = false;
        this.wasConsumed = false;
    }

    update(dt){
        super.update(dt);
    }

    render(offset = { x: 0, y: 0 }){
        super.render(offset);
    }

    onCollide(entity){
        this.wasCollided = true;
    }

    onConsume(consumer){
        return;
    }
}