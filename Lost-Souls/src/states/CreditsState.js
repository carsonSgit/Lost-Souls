import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	VILLAGE_BACKGROUND_IMAGE_SRC,
	backgroundImage,
	keys,
	loadGameState,
	sounds,
	stateMachine,
} from "../globals.js";
import SoundName from "../enums/SoundName.js";
export default class CreditsState extends State {

	constructor() {
		super();
	}

	enter(parameters){
		// Stop village sound playback (No audio overlap)
		sounds.stop(SoundName.VillageTheme);
		// Play CreditsTheme sound
		sounds.play(SoundName.CreditsTheme);
		this.map = parameters.map;
	}

	exit(){
		sounds.stop(SoundName.CreditsTheme);
	}

	update(dt){
		this.map.update(dt)
		// Do we exit the credits state?
		if(keys.Enter){
			keys.Enter = false;
			// Change back to Title Screen
			stateMachine.change(GameStateName.TitleScreen);
		}
	}

	render(context){
		context.save();
		this.map.render();
		this.renderCreditsScreen(context);
		context.restore();
	}

	/*
	* Credits Rendering
	* 
	* Uses two fonts for better readability (some letters are not as legible in Dungeon font)
	* 
	* Credits are split into 4 categories:
	* Coding, Art, Audio, Fonts
	* 
	* Credits are also visible in Inspect -> Elements -> div id="GAME ART/SOUNDS/FONTS CREDITS"
	*/
	renderCreditsScreen(context){
		context.font = '60px Dungeon';
		context.fillStyle = 'white';
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
		context.font = '30px Dungeon';
		
		// Credit Screen Header
		context.fillText('Credits', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

		// Credit Screen Sub-headers
		context.font = '24px Compass';
		context.fillStyle = 'white';
		context.fillText('Coding', CANVAS_WIDTH / 2 - 210, CANVAS_HEIGHT / 2 + 50);
		context.fillText('Art', CANVAS_WIDTH / 2 - 70, CANVAS_HEIGHT / 2 + 50);
		context.fillText('Audio', CANVAS_WIDTH / 2 + 70, CANVAS_HEIGHT / 2 + 50);
		context.fillText('Fonts', CANVAS_WIDTH / 2 + 210, CANVAS_HEIGHT / 2 + 50);

		// Credit Screen people-to-be-credited Styling
		context.fillStyle = 'black';
		context.font = '21px Compass';

		// Coding Credits
		context.fillText('NoahGJAC', CANVAS_WIDTH / 2 - 210, CANVAS_HEIGHT / 2 + 75);
		context.fillText('carsonSgit', CANVAS_WIDTH / 2 - 210, CANVAS_HEIGHT / 2 + 93);

		// Art Credits
		context.fillText('Szadi art.', CANVAS_WIDTH / 2 - 70, CANVAS_HEIGHT / 2 + 75);
		context.fillText('LuizMelo', CANVAS_WIDTH / 2 - 70, CANVAS_HEIGHT / 2 + 93);
		context.fillText('ansimuz', CANVAS_WIDTH / 2 - 70, CANVAS_HEIGHT / 2 + 111);
		context.fillText('chierit', CANVAS_WIDTH / 2 - 70, CANVAS_HEIGHT / 2 + 129);
		context.fillText('brullov', CANVAS_WIDTH / 2 - 70, CANVAS_HEIGHT / 2 + 147);
		
		// Audio Credits
		context.fillText('Leohpaz', CANVAS_WIDTH / 2 + 70, CANVAS_HEIGHT / 2 + 75);
		context.fillText('xDeviruchi', CANVAS_WIDTH / 2 + 70, CANVAS_HEIGHT / 2 + 93);

		// Font Credits
		context.fillText('vrtxrry', CANVAS_WIDTH / 2 + 210, CANVAS_HEIGHT / 2 + 75);
		context.fillText('somepx', CANVAS_WIDTH / 2 + 210, CANVAS_HEIGHT / 2 + 93);
		context.fillText('GGBotNet', CANVAS_WIDTH / 2 + 210, CANVAS_HEIGHT / 2 + 111);
	}
}
