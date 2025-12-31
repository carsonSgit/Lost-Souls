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

		// Atmospheric particles
		this.particles = [];
		this.animationTimer = 0;
	}

	initializeParticles() {
		// Create floating ember/dust particles for atmosphere
		this.particles = [];
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

	enter(parameters){
		// Stop village sound playback (No audio overlap)
		sounds.stop(SoundName.VillageTheme);
		// Play CreditsTheme sound
		sounds.play(SoundName.CreditsTheme);
		this.map = parameters.map;
		this.initializeParticles();
	}

	exit(){
		// If exiting, stop playing credits theme
		sounds.stop(SoundName.CreditsTheme);
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
		this.renderAtmosphericEffects(context);
		this.renderCreditsScreen(context);
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
		const pulse = Math.sin(this.animationTimer * 1.5) * 0.1 + 1;

		context.textBaseline = 'middle';
		context.textAlign = 'center';

		// Title with enhanced effects
		context.font = '60px Dungeon';
		// Deep shadow layers
		context.globalAlpha = 0.5;
		context.fillStyle = 'rgba(0, 0, 0, 0.8)';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2 + 4, CANVAS_HEIGHT / 2 - 20 + 4);

		// Outer glow
		context.globalAlpha = 0.6 * pulse;
		context.shadowBlur = 25;
		context.shadowColor = 'rgba(180, 50, 30, 0.8)';
		context.fillStyle = 'rgba(180, 50, 30, 0.4)';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

		// Main text
		context.globalAlpha = 1;
		context.shadowBlur = 12;
		context.shadowColor = 'rgba(255, 180, 100, 0.8)';
		context.fillStyle = '#f5e6d3';
		context.fillText('Lost Souls', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

		context.shadowBlur = 0;

		// Credit Screen Header
		context.font = '30px Dungeon';
		context.shadowBlur = 8;
		context.shadowColor = 'rgba(212, 175, 119, 0.6)';
		context.fillStyle = '#d4af77';
		context.fillText('Credits', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
		context.shadowBlur = 0;

		// Credit Screen Sub-headers
		context.font = '24px Compass';
		context.shadowBlur = 5;
		context.shadowColor = 'rgba(255, 215, 100, 0.5)';
		context.fillStyle = '#ffd966';
		context.fillText('Coding', CANVAS_WIDTH / 2 - 210, CANVAS_HEIGHT / 2 + 50);
		context.fillText('Art', CANVAS_WIDTH / 2 - 70, CANVAS_HEIGHT / 2 + 50);
		context.fillText('Audio', CANVAS_WIDTH / 2 + 70, CANVAS_HEIGHT / 2 + 50);
		context.fillText('Fonts', CANVAS_WIDTH / 2 + 210, CANVAS_HEIGHT / 2 + 50);
		context.shadowBlur = 0;

		// Credit Screen people-to-be-credited Styling
		context.fillStyle = '#e8e8e8';
		context.font = '21px Compass';
		context.shadowBlur = 3;
		context.shadowColor = 'rgba(0, 0, 0, 0.6)';

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

		context.shadowBlur = 0;
	}
}
