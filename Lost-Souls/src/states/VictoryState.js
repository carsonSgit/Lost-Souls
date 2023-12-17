import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import SoundName from "../enums/SoundName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, keys, sounds, stateMachine } from "../globals.js";

export default class VictoryState extends State {
	constructor() {
		super();
	}

	enter(parameters){
		this.map = parameters.map;

		// Sound effect for Victory effect show up
		sounds.play(SoundName.Sword_Swing);
		sounds.stop(SoundName.Sword_Swing);

		// Render door only after entering victory state
			// this makes sure the player gets sent to victory state & doesn't skip by going to village
		this.map.door.isSolid = true;
		this.map.door.isCollidable = true;
		this.map.door.shouldRender = true;
	}

	update(dt){
		// If we hit the Enter key, return to the game
		if(keys.Enter){
			keys.Enter = false;
			stateMachine.change(GameStateName.Play, 
				{
					map: this.map,
					fromVictory: true
			});
		}
	}

	// Victory Screen Renders
	render(context){
		context.save();
		this.map.render();
		this.renderVictoryScreen(context);
		context.restore();
	}

	// Victory Screen Rendering formatting
	renderVictoryScreen(context){
		// Victory Header
		context.font = '60px Pixeloid';
		context.fillStyle = 'black';
		context.shadowColor = 'rgb(255, 20, 20)';
		context.shadowOffset = {x: 2, y: 2};
		context.shadowBlur = 3;
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Victory', CANVAS_WIDTH/2, CANVAS_HEIGHT/ 2 - 20);

		// This run's Score Display 
		context.shadowBlur = 1;
		context.font = '24px Pixeloid';
		context.fillText('Score: ' + this.map.player.score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

		// Return to game prompt
		context.font = '18px Pixeloid';
		context.fillText('Press Enter to return to the game', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
	}
}
