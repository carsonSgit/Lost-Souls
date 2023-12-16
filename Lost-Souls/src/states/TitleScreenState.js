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
		
		/*
		 * Fun interactable menu interface derived from Vikram Singh's menu interface code
		 * @see https://jac-cs-game-programming-f23.github.io/Notes/#/1-Breakout/
		 * @see https://github.com/JAC-CS-Game-Programming-F23/1-Breakout/blob/main/src/Breakout-1/src/states/TitleScreenState.js 
		 */

		this.menuOptions = {
			play: "Play",
			credits: "Credits",
		}

		this.highlighted = this.menuOptions.play;
	}
	update(dt){
		this.map.update(dt)

		if (keys.w || keys.s) {
			keys.w = false;
			keys.s = false;
			this.highlighted = this.highlighted === this.menuOptions.play ? this.menuOptions.credits : this.menuOptions.play;
			// sounds.play followed by sounds.stop so that audio plays on every switch
			sounds.play(SoundName.Sword_Swing)
			sounds.stop(SoundName.Sword_Swing)
		}

		if(keys.Enter){
			if(this.highlighted === this.menuOptions.play){
				keys.Enter = false;
				this.map.player.stateMachine.currentState.stopPraying();
				stateMachine.change(
					GameStateName.Play,
					{
						map: this.map,
					});
			}
			else if(this.highlighted === this.menuOptions.credits){
				keys.Enter = false;
				stateMachine.change(
					GameStateName.Credits,
					{
						map: this.map,
					});
			}
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
		
		context.fillStyle = this.highlighted === this.menuOptions.play ? "DarkKhaki" : "white";
		context.fillText(`${this.menuOptions.play}`, CANVAS_WIDTH * 0.5, CANVAS_HEIGHT / 2 + 90);
		context.fillStyle = this.highlighted === this.menuOptions.credits ? "DarkKhaki" : "white";
		context.fillText(`${this.menuOptions.credits}`, CANVAS_WIDTH * 0.5, CANVAS_HEIGHT / 2 + 115);

		context.fillStyle = 'white';
		context.fillText('Press Enter to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
		//context.fillText('Press L to load game', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
	}
}
