import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js"

export default class SkeletonIdleState extends State{

        constructor(skeleton){
            super();
            this.skeleton = skeleton;

            this.animation = new Animation([0, 1, 2, 3], 0.15);
        }

        enter(){
            this.skeleton.currentAnimation = this.animation;
            this.skeleton.sprites = this.skeleton.idleSprites;
        }

        update(dt){

        }
}