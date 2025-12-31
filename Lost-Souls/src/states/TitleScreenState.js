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

		/**
		 * Fun interactable menu interface derived from Vikram Singh's menu interface code
		 *
		 * @see https://jac-cs-game-programming-f23.github.io/Notes/#/1-Breakout/
		 * @see https://github.com/JAC-CS-Game-Programming-F23/1-Breakout/blob/main/src/Breakout-1/src/states/TitleScreenState.js
		 */
		this.menuOptions = {
			play: "Play",
			credits: "Credits",
		}

		this.highlighted = this.menuOptions.play;

		// Atmospheric particles
		this.particles = [];
		this.initializeParticles();

		// Animation timer for pulsing effects
		this.animationTimer = 0;
	}

	initializeParticles() {
		// Create floating ember/dust particles for atmosphere
		for (let i = 0; i < 40; i++) {
			this.particles.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * CANVAS_HEIGHT,
				size: Math.random() * 2 + 0.5,
				speedY: -(Math.random() * 0.3 + 0.1),
				speedX: (Math.random() - 0.5) * 0.3,
				opacity: Math.random() * 0.5 + 0.2,
				flicker: Math.random() * Math.PI * 2,
			});
		}
	}
	update(dt){
		this.map.update(dt)

		// Update animation timer
		this.animationTimer += dt;

		// Update particles
		this.particles.forEach(particle => {
			particle.y += particle.speedY;
			particle.x += particle.speedX;
			particle.flicker += dt * 2;

			// Reset particle when it goes off screen
			if (particle.y < -10) {
				particle.y = CANVAS_HEIGHT + 10;
				particle.x = Math.random() * CANVAS_WIDTH;
			}
			if (particle.x < -10) {
				particle.x = CANVAS_WIDTH + 10;
			}
			if (particle.x > CANVAS_WIDTH + 10) {
				particle.x = -10;
			}
		});

		// If any Menu cycling key input ...
		if ((keys.w || keys.s || keys.ArrowUp || keys.ArrowDown) || (keys.W || keys.S)) {
			keys.w = false;
			keys.s = false;
			keys.ArrowUp = false;
			keys.ArrowDown = false;
			// Change highlighted menu option to newly selected menu option
			this.highlighted = this.highlighted === this.menuOptions.play ? this.menuOptions.credits : this.menuOptions.play;
			// sounds.play followed by sounds.stop so that audio plays on every switch
			sounds.play(SoundName.Sword_Swing)
			sounds.stop(SoundName.Sword_Swing)
		}

		// If enter key is pressed, change to selected menu option
		if(keys.Enter){
			sounds.play(SoundName.Confirm)
			sounds.stop(SoundName.Confirm)
			// If Play option is selected, change to play state
			if(this.highlighted === this.menuOptions.play){
				keys.Enter = false;
				this.map.player.stateMachine.currentState.stopPraying();
				stateMachine.change(
					GameStateName.Play,
					{
						map: this.map,
					});
			}
			// If Credits option is selected, change to credits state
			else if(this.highlighted === this.menuOptions.credits){
				keys.Enter = false;
				stateMachine.change(
					GameStateName.Credits,
					{
						map: this.map,
					});
			}
		}
	}

	enter(){
		// Stop Cave Theme sound
		sounds.stop(SoundName.CaveTheme);

		// Send in all map definitions
		this.map = new Map(this.caveDefinition, this.villageDefinition, this.bossDefinition);

		// Play Village Theme sound
		sounds.play(SoundName.VillageTheme);

		// Set background image to Village
		backgroundImage.src = VILLAGE_BACKGROUND_IMAGE_SRC;
	}

	exit(){
		// Stop playing the sound
		sounds.stop(SoundName.VillageTheme);
	}

	// Title Screen Renders
	render(context){
		context.save();
		this.map.render();
		this.renderAtmosphericEffects(context);
		this.renderTitleWindow(context);
		context.restore();
	}

	// Render atmospheric particles and vignette
	renderAtmosphericEffects(context) {
		// Render floating particles (embers/dust)
		this.particles.forEach(particle => {
			const flickerOpacity = particle.opacity * (0.7 + Math.sin(particle.flicker) * 0.3);

			context.save();
			context.globalAlpha = flickerOpacity;

			// Particle glow
			const gradient = context.createRadialGradient(
				particle.x, particle.y, 0,
				particle.x, particle.y, particle.size * 3
			);
			gradient.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
			gradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.3)');
			gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
			context.fill();

			// Particle core
			context.fillStyle = 'rgba(255, 220, 150, 0.9)';
			context.beginPath();
			context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
			context.fill();

			context.restore();
		});

		// Dark vignette overlay for atmosphere
		const vignetteGradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.3,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.8
		);
		vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
		vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

		context.fillStyle = vignetteGradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	// Title Screen Rendering
	renderTitleWindow(context) {
		const pulse = Math.sin(this.animationTimer * 1.5) * 0.1 + 1;
		const titleY = CANVAS_HEIGHT / 2 - 20;

		// Title Screen Header with multiple layers for depth
		context.textBaseline = 'middle';
		context.textAlign = 'center';

		// Deep shadow layers
		context.font = '60px Dungeon';
		context.globalAlpha = 0.5;
		context.fillStyle = 'rgba(0, 0, 0, 0.8)';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2 + 6, titleY + 6);
		context.fillText('Lost Souls', CANVAS_WIDTH / 2 + 4, titleY + 4);

		// Outer glow (dark red/orange)
		context.globalAlpha = 0.6 * pulse;
		context.shadowBlur = 30;
		context.shadowColor = 'rgba(180, 50, 30, 0.8)';
		context.fillStyle = 'rgba(180, 50, 30, 0.4)';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, titleY);

		// Inner glow (brighter orange)
		context.shadowBlur = 20;
		context.shadowColor = 'rgba(255, 120, 60, 0.9)';
		context.fillStyle = 'rgba(255, 140, 80, 0.6)';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, titleY);

		// Main title text
		context.globalAlpha = 1;
		context.shadowBlur = 15;
		context.shadowColor = 'rgba(255, 180, 100, 0.8)';
		context.fillStyle = '#f5e6d3';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, titleY);

		// Highlight edge
		context.shadowBlur = 8;
		context.shadowColor = 'rgba(255, 220, 150, 1)';
		context.fillStyle = '#fff8e7';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, titleY - 1);

		// Reset shadow
		context.shadowBlur = 0;
		context.globalAlpha = 1;

		// Subtitle with fade-in effect
		const subtitleOpacity = 0.6 + Math.sin(this.animationTimer * 2) * 0.15;
		context.font = '20px Dungeon';
		context.globalAlpha = subtitleOpacity;
		context.fillStyle = '#d4af77';
		context.shadowBlur = 10;
		context.shadowColor = 'rgba(212, 175, 119, 0.5)';
		context.fillText('Press Enter to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
		context.shadowBlur = 0;
		context.globalAlpha = 1;

		// Title Screen Menu Options with enhanced styling
		context.font = '28px Dungeon';

		// Play option
		const playY = CANVAS_HEIGHT / 2 + 90;
		if (this.highlighted === this.menuOptions.play) {
			// Highlighted - golden glow
			context.shadowBlur = 15;
			context.shadowColor = 'rgba(218, 165, 32, 0.8)';
			context.fillStyle = '#daa520';
			context.fillText(`> ${this.menuOptions.play} <`, CANVAS_WIDTH * 0.5, playY);
			context.shadowBlur = 8;
			context.shadowColor = 'rgba(255, 215, 0, 1)';
			context.fillStyle = '#ffd700';
			context.fillText(`> ${this.menuOptions.play} <`, CANVAS_WIDTH * 0.5, playY);
		} else {
			// Non-highlighted
			context.shadowBlur = 5;
			context.shadowColor = 'rgba(0, 0, 0, 0.5)';
			context.fillStyle = '#b8b8b8';
			context.fillText(this.menuOptions.play, CANVAS_WIDTH * 0.5, playY);
		}

		// Credits option
		const creditsY = CANVAS_HEIGHT / 2 + 125;
		if (this.highlighted === this.menuOptions.credits) {
			// Highlighted - golden glow
			context.shadowBlur = 15;
			context.shadowColor = 'rgba(218, 165, 32, 0.8)';
			context.fillStyle = '#daa520';
			context.fillText(`> ${this.menuOptions.credits} <`, CANVAS_WIDTH * 0.5, creditsY);
			context.shadowBlur = 8;
			context.shadowColor = 'rgba(255, 215, 0, 1)';
			context.fillStyle = '#ffd700';
			context.fillText(`> ${this.menuOptions.credits} <`, CANVAS_WIDTH * 0.5, creditsY);
		} else {
			// Non-highlighted
			context.shadowBlur = 5;
			context.shadowColor = 'rgba(0, 0, 0, 0.5)';
			context.fillStyle = '#b8b8b8';
			context.fillText(this.menuOptions.credits, CANVAS_WIDTH * 0.5, creditsY);
		}

		// Reset shadow
		context.shadowBlur = 0;
	}
}
