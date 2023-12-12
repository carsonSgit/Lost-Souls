/**
 * Lost Souls
 *
 * Authors
 * Carson Spriggs-Audet
 * Noah Groleau
 *
 * Brief description
 *TODO
 * Asset sources
 * 
 * Player sprite
 * @see https://szadiart.itch.io/2d-soulslike-character
 * Cave map
 * @see https://szadiart.itch.io/pixel-fantasy-caves
 * Fonts
 * @see https://vrtxrry.itch.io/dungeonfont
 */

import GameStateName from "./enums/GameStateName.js";
import Game from "../lib/Game.js";
import {
	canvas,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	fonts,
	images,
	keys,
	sounds,
	stateMachine,
} from "./globals.js";
import PlayState from "./states/PlayState.js";
import GameOverState from "./states/GameOverState.js";
import VictoryState from "./states/VictoryState.js";
import TitleScreenState from "./states/TitleScreenState.js";
import CreditsState from "./states/CreditsState.js";

// Set the dimensions of the play area.
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.setAttribute('tabindex', '1'); // Allows the canvas to receive user input.

// Now that the canvas element has been prepared, we can add it to the DOM.
document.body.appendChild(canvas);

// Fetch the asset definitions from config.json.
const {
	images: imageDefinitions,
	fonts: fontDefinitions,
	sounds: soundDefinitions,
} = await fetch('./src/config.json').then((response) => response.json());

// Fetch the level definitions from their JSON files.
const villageDefinition = await fetch('../config/village.json').then((response) => response.json());
const caveDefinition = await fetch('../config/cave.json').then((response) => response.json());
const bossMapDefinition = await fetch('../config/bossMap.json').then((response) => response.json());
// Load all the assets from their definitions.
images.load(imageDefinitions);
fonts.load(fontDefinitions);
sounds.load(soundDefinitions);

// Add all the states to the state machine.

// stateMachine.add(GameStateName.TitleScreen, new TitleScreenState(villageDefinition, caveDefinition, bossMapDefinition));

stateMachine.add(GameStateName.TitleScreen, new TitleScreenState(caveDefinition));
stateMachine.add(GameStateName.GameOver, new GameOverState());
stateMachine.add(GameStateName.Victory, new VictoryState());
stateMachine.add(GameStateName.Credits, new CreditsState());
stateMachine.add(GameStateName.Play, new PlayState(caveDefinition));

stateMachine.change(GameStateName.TitleScreen);
// stateMachine.change(GameStateName.Play)

// Add event listeners for player input.
canvas.addEventListener('keydown', event => {
	keys[event.key] = true;
});

canvas.addEventListener('keyup', event => {
	keys[event.key] = false;
});

const game = new Game(stateMachine, context, canvas.width, canvas.height);

game.start();

// Focus the canvas so that the player doesn't have to click on it.
canvas.focus();
