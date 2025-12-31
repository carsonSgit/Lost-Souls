import Camera from "../../lib/Camera.js";
import Map from "../../lib/Map.js";
import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import SoundName from "../enums/SoundName.js";
import { keys, sounds, stateMachine, timer } from "../globals.js";
import HUD from "../objects/HUD.js";
import AmbientEffects from "../objects/AmbientEffects.js";

export default class PlayState extends State {
	constructor() {
		super();
		this.hud = null;
		this.ambientEffects = null;
	}

	enter(parameters){
		this.map = parameters.map;
		this.fromPause = parameters.fromPause;
		this.fromVictory = parameters.fromVictory;

		// Initialize HUD with player reference
		if (!this.hud) {
			this.hud = new HUD(this.map.player);
		}
		// Connect HUD to map for combo/kill tracking
		this.hud.map = this.map;

		// Set boss for HUD when in boss arena
		if (this.map.collisionLayer === this.map.bossCollisionLayer) {
			this.hud.setBoss(this.map.boss);
		} else {
			this.hud.setBoss(null);
		}

		// Initialize ambient effects
		if (!this.ambientEffects) {
			this.ambientEffects = new AmbientEffects();
		}

		// Set ambient mode based on current level
		if (this.map.collisionLayer === this.map.villageCollisionLayer) {
			this.ambientEffects.setMode('village');
		} else if (this.map.collisionLayer === this.map.caveCollisionLayer) {
			this.ambientEffects.setMode('cave');
		} else if (this.map.collisionLayer === this.map.bossCollisionLayer) {
			this.ambientEffects.setMode('boss');
		}

		// Play Village Theme sound
		if(!this.fromVictory && !this.fromPause)
			sounds.play(SoundName.VillageTheme);
	}

	update(dt){
		timer.update(dt);
		this.map.update(dt);

		// Update HUD
		if (this.hud) {
			this.hud.update(dt);

			// Update boss health bar visibility based on current level and boss state
			if (this.map.collisionLayer === this.map.bossCollisionLayer && this.map.boss && !this.map.boss.isDead) {
				this.hud.setBoss(this.map.boss);
			} else {
				this.hud.setBoss(null);
			}
		}

		// Update ambient effects
		if (this.ambientEffects) {
			this.ambientEffects.update(dt);

			// Update ambient mode based on current level
			if (this.map.collisionLayer === this.map.villageCollisionLayer) {
				this.ambientEffects.setMode('village');
			} else if (this.map.collisionLayer === this.map.caveCollisionLayer) {
				this.ambientEffects.setMode('cave');
			} else if (this.map.collisionLayer === this.map.bossCollisionLayer) {
				this.ambientEffects.setMode('boss');
			}
		}

		// If key p is pressed, change to Pause state
		if(keys.p || keys.P){
			keys.p = false;
			// Play pause sound effect
			sounds.play(SoundName.Pause);
			sounds.stop(SoundName.Pause);
			// Change to pause state
			stateMachine.change(
				GameStateName.Pause, {
					map: this.map
				}
			);
		}
	}

	// Play state Renders
	render(context){
		context.save();
		this.map.render();
		context.restore();

		// Render ambient effects (fog, vignette, color grading)
		if (this.ambientEffects) {
			this.ambientEffects.render();
		}

		// Render HUD on top of everything
		if (this.hud) {
			this.hud.render();
		}
	}
}
