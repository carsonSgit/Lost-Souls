import Fonts from "../lib/Fonts.js";
import Game from "../lib/Game.js";
import Images from "../lib/Images.js";
import Sounds from "../lib/Sounds.js";
import StateMachine from "../lib/StateMachine.js";
import Timer from "../lib/Timer.js";

export const canvas = document.createElement('canvas');
export const context = canvas.getContext('2d') || new CanvasRenderingContext2D();

// Replace these values according to how big you want your canvas.
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 480;

export const keys = {};
export const images = new Images(context);
export const fonts = new Fonts();
export const stateMachine = new StateMachine();
export const timer = new Timer();
export const sounds = new Sounds();


// Set the background image
export const CAVE_BACKGROUND_IMAGE_SRC = "./assets/images/Backgrounds/caveBackground.png";
export const VILLAGE_BACKGROUND_IMAGE_SRC = "./assets/images/Backgrounds/villageBackground.png";
export const BOSS_ARENA_BACKGROUND_IMAGE_SRC = "./assets/images/Backgrounds/finalBossBackground.png";

// Load the background image
export const backgroundImage = new Image();
backgroundImage.src = VILLAGE_BACKGROUND_IMAGE_SRC;



export const DEBUG = false;

//Saving functions

export function saveGameState(){
    const game = new Game(stateMachine, context, canvas.width, canvas.height);
	const serializedGameState = JSON.stringify(game);
	localStorage.setItem("gameState", serializedGameState);
}

export function loadGameState(){
	const serializedGameState = localStorage.getItem("gameState");
    console.log(serializedGameState);
	if(serializedGameState){
		return JSON.parse(serializedGameState);
		//would need to assign values to stateMachine, context, canvas.width, canvas.height ...
		//like const stateMachine = this.game.stateMachine;
	}

	return new Game(stateMachine, context, canvas.width, canvas.height);
}
