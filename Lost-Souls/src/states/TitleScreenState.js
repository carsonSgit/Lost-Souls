import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import Map from "../../lib/Map.js";
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
export default class TitleScreenState extends State {
	constructor(caveDefinition, villageDefinition, bossDefinition) {
		super();

		this.caveDefinition = caveDefinition;
		this.villageDefinition = villageDefinition;
		this.bossDefinition = bossDefinition;

		this.map = new Map(caveDefinition, villageDefinition, bossDefinition);
		
		
	}
	update(dt){
		this.map.update(dt)
		if(keys.Enter){
			this.map.player.stateMachine.currentState.stopPraying();
			stateMachine.change(
				GameStateName.Play,
				{
					map: this.map,
				});
		}
		/*Game loading is disabled for now
		if(keys.l || keys.L){
			loadGameState();
			keys.l = false;
			keys.L = false;
			stateMachine.change(
				GameStateName.Play,
				{
					map: this.map,
				});
		}*/
	}

	enter(){
		sounds.stop(SoundName.CaveTheme);
		this.map = new Map(this.caveDefinition, this.villageDefinition, this.bossDefinition);
		sounds.play(SoundName.VillageTheme);
		backgroundImage.src = VILLAGE_BACKGROUND_IMAGE_SRC;
	}

	exit(){
		sounds.stop(SoundName.VillageTheme);
	}

	render(context){
		context.save();
		this.map.render();
		this.renderTitleWindow(context);
		context.restore();
	}

	renderTitleWindow(context) {
		context.font = '60px Dungeon';
		context.fillStyle = 'white';
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
		context.font = '24px Dungeon';
		context.fillText('Press Enter to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
		//context.fillText('Press L to load game', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
	}
}
