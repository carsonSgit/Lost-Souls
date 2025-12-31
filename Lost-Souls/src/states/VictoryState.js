import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import SoundName from "../enums/SoundName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, keys, sounds, stateMachine } from "../globals.js";

export default class VictoryState extends State {
	constructor() {
		super();

		// Atmospheric particles
		this.particles = [];
		this.animationTimer = 0;
	}

	initializeParticles() {
		// Create floating ember/dust particles for atmosphere - more golden for victory
		this.particles = [];
		for (let i = 0; i < 50; i++) {
			this.particles.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * CANVAS_HEIGHT,
				size: Math.random() * 2.5 + 0.5,
				speedY: -(Math.random() * 0.4 + 0.15),
				speedX: (Math.random() - 0.5) * 0.4,
				opacity: Math.random() * 0.6 + 0.3,
				flicker: Math.random() * Math.PI * 2,
			});
		}
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
		this.renderAtmosphericEffects(context);
		this.renderVictoryScreen(context);
		context.restore();
	}

	// Render atmospheric particles and vignette - golden theme for victory
	renderAtmosphericEffects(context) {
		// Render floating particles (golden embers for victory)
		this.particles.forEach(particle => {
			const flickerOpacity = particle.opacity * (0.7 + Math.sin(particle.flicker) * 0.3);

			context.save();
			context.globalAlpha = flickerOpacity;

			// Particle glow - more golden/yellow for victory
			const gradient = context.createRadialGradient(
				particle.x, particle.y, 0,
				particle.x, particle.y, particle.size * 3
			);
			gradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
			gradient.addColorStop(0.5, 'rgba(255, 180, 50, 0.5)');
			gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');

			context.fillStyle = gradient;
			context.beginPath();
			context.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
			context.fill();

			// Particle core
			context.fillStyle = 'rgba(255, 235, 150, 1)';
			context.beginPath();
			context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
			context.fill();

			context.restore();
		});

		// Lighter vignette for victory (less dark)
		const vignetteGradient = context.createRadialGradient(
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.3,
			CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_HEIGHT * 0.8
		);
		vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
		vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

		context.fillStyle = vignetteGradient;
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	// Victory Screen Rendering formatting
	renderVictoryScreen(context){
		const pulse = Math.sin(this.animationTimer * 2) * 0.15 + 1;

		context.textBaseline = 'middle';
		context.textAlign = 'center';

		// Victory Header with enhanced golden effects
		context.font = '60px Dungeon';
		// Deep shadow
		context.globalAlpha = 0.5;
		context.fillStyle = 'rgba(0, 0, 0, 0.8)';
		context.fillText('Victory', CANVAS_WIDTH / 2 + 5, CANVAS_HEIGHT / 2 - 20 + 5);

		// Outer glow (golden)
		context.globalAlpha = 0.7 * pulse;
		context.shadowBlur = 30;
		context.shadowColor = 'rgba(255, 215, 0, 1)';
		context.fillStyle = 'rgba(255, 215, 0, 0.5)';
		context.fillText('Victory', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

		// Inner glow (brighter gold)
		context.shadowBlur = 20;
		context.shadowColor = 'rgba(255, 235, 100, 1)';
		context.fillStyle = 'rgba(255, 235, 100, 0.7)';
		context.fillText('Victory', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

		// Main text
		context.globalAlpha = 1;
		context.shadowBlur = 15;
		context.shadowColor = 'rgba(255, 215, 0, 1)';
		context.fillStyle = '#fffacd';
		context.fillText('Victory', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

		context.shadowBlur = 0;

		// This run's Score Display
		context.font = '38px Dungeon';
		context.shadowBlur = 8;
		context.shadowColor = 'rgba(255, 215, 100, 0.7)';
		context.fillStyle = '#ffd966';
		context.fillText('Score: ' + this.map.player.score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

		// Return to game prompt
		context.font = '28px Dungeon';
		context.shadowBlur = 5;
		context.shadowColor = 'rgba(0, 0, 0, 0.6)';
		context.fillStyle = '#e8e8e8';
		context.fillText('Press Enter to return', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);

		context.shadowBlur = 0;
	}
}
