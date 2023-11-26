export default class SoundPool {
	/**
	 * Manages an array of sounds so that we can play the same sound
	 * multiple times in our game without having to wait for one sound
	 * to be finished playing before playing the same sound again.
	 *
	 * @param {String} source
	 * @param {Number} size
	 * @see https://blog.sklambert.com/html5-canvas-game-html5-audio-and-finishing-touches/
	 */
	constructor(source, size = 1, volume, loop = false) {
		this.source = source;
		this.size = size;
		this.volume = volume;
		this.loop = loop;
		this.pool = [];
		this.currentSound = 0;

		this.initializePool();
	}

	initializePool() {
		for (let i = 0; i < this.size; i++) {
			const audio = new Audio(this.source);

			audio.volume = this.volume;
			audio.loop = this.loop;

			this.pool.push(audio);
		}
	}

	/**
	 * Checks if the currentSound is ready to play, plays the sound,
	 * then increments the currentSound counter.
	 */
	play() {
		if (this.pool[this.currentSound].currentTime === 0
			|| this.pool[this.currentSound].ended
			|| this.pool[this.currentSound].paused) {
			this.pool[this.currentSound].play();
		}

		this.currentSound = (this.currentSound + 1) % this.size;
	}

	pause() {
		this.pool[this.currentSound].pause();
	}

	isPaused() {
		return this.pool[this.currentSound].paused;
	}

	stop() {
		this.pause();
		this.pool[this.currentSound].currentTime = 0;
	}
}
