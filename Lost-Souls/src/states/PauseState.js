import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";
import SoundName from "../enums/SoundName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, keys, saveGameState, sounds, stateMachine } from "../globals.js";

export default class PauseState extends State{

    constructor(){
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

        // If 'P' key, Re-enter play-state
        if(keys.p || keys.P){
            // Play unpause sound effect
            sounds.play(SoundName.Unpause);
            sounds.stop(SoundName.Unpause);
            keys.p = false;
            keys.P = false;
            // Change back to play state
            stateMachine.change(
                GameStateName.Play,{
                    map: this.map,
                    fromPause: true
                }
            );
        }
        // Saving is enabled when the 's' key is pressed
        if(keys.s || keys.S){
            keys.s = false;
            keys.S = false;

            // Save player score to localStorage
            localStorage.setItem('playerScore', this.map.player.score);
        }
    }

    // Pause Screen Renders
    render(context){
        context.save();
        this.map.render();
        this.renderAtmosphericEffects(context);
        this.renderMenuScreen(context);
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

    // Pause Screen Rendering format
    renderMenuScreen(context){
        const pulse = Math.sin(this.animationTimer * 1.5) * 0.1 + 1;

        context.textBaseline = 'middle';
        context.textAlign = 'center';

        // Pause Screen Header with enhanced effects
        context.font = '60px Dungeon';
        // Deep shadow
        context.globalAlpha = 0.5;
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillText('Paused', CANVAS_WIDTH / 2 + 4, CANVAS_HEIGHT / 2 - 20 + 4);

        // Outer glow
        context.globalAlpha = 0.6 * pulse;
        context.shadowBlur = 25;
        context.shadowColor = 'rgba(100, 150, 200, 0.8)';
        context.fillStyle = 'rgba(100, 150, 200, 0.4)';
        context.fillText('Paused', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        // Main text
        context.globalAlpha = 1;
        context.shadowBlur = 12;
        context.shadowColor = 'rgba(180, 200, 255, 0.8)';
        context.fillStyle = '#e6f0ff';
        context.fillText('Paused', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        context.shadowBlur = 0;

        // Pause Screen Exit prompt
        context.font = '24px Dungeon';
        context.shadowBlur = 5;
        context.shadowColor = 'rgba(0, 0, 0, 0.6)';
        context.fillStyle = '#e8e8e8';
        context.fillText('Press \'P\' to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);

        // Pause Screen Save prompt
        context.font = '20px Dungeon';
        context.fillStyle = '#d4af77';
        context.fillText('Press \'S\' to save score', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);

        context.shadowBlur = 0;

        // Player Score render
        context.font = '32px Dungeon';
        context.shadowBlur = 6;
        context.shadowColor = 'rgba(255, 215, 100, 0.6)';
        context.fillStyle = '#ffd966';
        context.textAlign = 'right';
        context.fillText('Score: ' + this.map.player.score, CANVAS_WIDTH - 40, CANVAS_HEIGHT - 20);

        // Player High Score render
        context.textAlign = 'left';
        context.fillText('High Score: ' + this.map.player.highScore, 20, CANVAS_HEIGHT - 20);

        context.shadowBlur = 0;
    }

}