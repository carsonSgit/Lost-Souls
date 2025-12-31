import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, keys, stateMachine, sounds } from "../globals.js";
import SoundName from "../enums/SoundName.js";

export default class GameOverState extends State {

	constructor() {
		super();

		// Atmospheric particles
		this.particles = [];
		this.animationTimer = 0;
	}

	initializeParticles() {
		// Create floating ash/ember particles for atmosphere - darker for game over
		this.particles = [];
		for (let i = 0; i < 35; i++) {
			this.particles.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * CANVAS_HEIGHT,
				size: Math.random() * 2 + 0.3,
				speedY: -(Math.random() * 0.25 + 0.08),
				speedX: (Math.random() - 0.5) * 0.25,
				opacity: Math.random() * 0.4 + 0.15,
				flicker: Math.random() * Math.PI * 2,
			});
		}
	}

	enter(parameters){
		this.map = parameters.map;
		this.initializeParticles();
	}

	update(dt){
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

		// If enter key is pressed, return to title screen
		if(keys.Enter){
			keys.Enter = false;
			stateMachine.change(GameStateName.TitleScreen);
		}
	}

	
	exit(){
		// If we are currently in cave, stop cave theme
		if(this.map.collisionLayer === this.map.caveCollisionLayer){
			sounds.stop(SoundName.CaveTheme);
		}
		// If we are currently in boss arena, stop boss theme
		if(this.map.collisionLayer === this.map.bossCollisionLayer){
			sounds.stop(SoundName.BossFight);
		}
	}

	// Game Over state render calls
	render(context){
		context.save();
		this.map.render();
		this.renderAtmosphericEffects(context);
		this.renderGameOverScreen(context);
		context.restore();
	}

	// Render atmospheric particles and vignette - darker theme for game over
	renderAtmosphericEffects(context) {
		// Render floating particles (dark ash/embers for game over)
		this.particles.forEach(particle => {
			const flickerOpacity = particle.opacity * (0.7 + Math.sin(particle.flicker) * 0.3);

			context.save();
			context.globalAlpha = flickerOpacity;

			// Particle glow - darker red/orange for death
			const gradient = context.createRadialGradient(
				particle.x, particle.y, 0,
				particle.x, particle.y, particle.size * 3
			);
			gradient.addColorStop(0, 'rgba(200, 50, 50, 0.7)');
			gradient.addColorStop(0.5, 'rgba(150, 30, 30, 0.3)');
			gradient.addColorStop(1, 'rgba(100, 20, 20, 0)');

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
			context.fill();

			// Particle core
			context.fillStyle = 'rgba(180, 60, 60, 0.8)';
			context.beginPath();
			context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
			context.fill();

			context.restore();
		});

		// Darker vignette for game over
		const vignetteGradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.2,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.8
		);
		vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		vignetteGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.5)');
		vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');

		context.fillStyle = vignetteGradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	// Game Over Rendering formatting
	renderGameOverScreen(context){
		const pulse = Math.sin(this.animationTimer * 1.2) * 0.12 + 1;

		context.textBaseline = 'middle';
		context.textAlign = 'center';

		// Game Over Header with enhanced dark/red effects
		context.font = '60px Pixeloid';
		// Deep shadow
		context.globalAlpha = 0.6;
		context.fillStyle = 'rgba(0, 0, 0, 0.9)';
		context.fillText('Game Over', CANVAS_WIDTH / 2 + 5, CANVAS_HEIGHT / 2 - 20 + 5);

		// Outer glow (dark red)
		context.globalAlpha = 0.7 * pulse;
		context.shadowBlur = 30;
		context.shadowColor = 'rgba(200, 20, 20, 0.9)';
		context.fillStyle = 'rgba(150, 20, 20, 0.5)';
		context.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

		// Inner glow (brighter red)
		context.shadowBlur = 20;
		context.shadowColor = 'rgba(255, 50, 50, 0.8)';
		context.fillStyle = 'rgba(200, 50, 50, 0.6)';
		context.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

		// Main text
		context.globalAlpha = 1;
		context.shadowBlur = 12;
		context.shadowColor = 'rgba(255, 60, 60, 0.9)';
		context.fillStyle = '#ff4444';
		context.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

		context.shadowBlur = 0;

		// This run's Score Display
		context.font = '28px Pixeloid';
		context.shadowBlur = 5;
		context.shadowColor = 'rgba(0, 0, 0, 0.7)';
		context.fillStyle = '#c0c0c0';
		context.fillText('Score: ' + this.map.player.highScore, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

		// Return to Title Screen Prompt
		context.font = '20px Pixeloid';
		context.shadowBlur = 4;
		context.shadowColor = 'rgba(0, 0, 0, 0.6)';
		context.fillStyle = '#a0a0a0';
		context.fillText('Press Enter to return to title screen', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);

		context.shadowBlur = 0;
	}
}
