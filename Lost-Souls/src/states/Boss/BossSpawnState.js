import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Tile from "../../../lib/Tile.js";
import Vector from "../../../lib/Vector.js";
import Boss from "../../entities/Boss.js";
import EnemyStateName from "../../enums/EnemyStateName.js";
import SoundName from "../../enums/SoundName.js";
import { sounds } from "../../globals.js";

export default class BossSpawnState extends State{
    constructor(boss){
        super();
        this.boss = boss;

        this.animation = new Animation(Boss.SPAWN_SPRITE_LOCATION, 0.1, 1);
    }

    enter(){
        this.boss.positionOffset = new Vector(Boss.SPAWN_OFFSET_WIDTH, 1);

        // Play fire sound effect (fire spawning)
        sounds.play(SoundName.Fire);

        // Boss spawning animation & sprites
        this.boss.currentAnimation = this.animation;
        this.boss.sprites = this.boss.spawnSprites;
        this.boss.currentAnimation.refresh();

        // Boss entrance visual effects
        if (this.boss.map && this.boss.map.entityEffects) {
            const centerX = this.boss.position.x + this.boss.dimensions.x / 2;
            const centerY = this.boss.position.y + this.boss.dimensions.y / 2;

            // Create dramatic spawn effect
            this.boss.map.entityEffects.createSpawnEffect(centerX, centerY, 'boss');

            // Create rising fire sparks
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    if (this.boss.map && this.boss.map.entityEffects) {
                        this.boss.map.entityEffects.createSpark(
                            centerX + (Math.random() - 0.5) * 60,
                            centerY + 30,
                            { count: 3, color: { r: 255, g: 100, b: 30 }, speed: 2 }
                        );
                    }
                }, i * 50);
            }
        }
    }

    exit(){
        this.boss.positionOffset =  new Vector(-Boss.SPRITE_WIDTH,1);
    }

    update(dt){
        // When animation is done ...
        if(this.boss.currentAnimation.isDone()){
            // Play fire sound effect (fire dissipating)
            sounds.play(SoundName.Fire);
            sounds.stop(SoundName.Fire);
            // Change to boss idle state
            this.boss.changeState(EnemyStateName.Idle);
        }
    }
}