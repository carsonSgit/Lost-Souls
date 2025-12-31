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

		// Initialize ambient effects
		if (!this.ambientEffects) {
			this.ambientEffects = new AmbientEffects();
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
		}

		// Update ambient effects
		if (this.ambientEffects) {
			this.ambientEffects.update(dt);
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
