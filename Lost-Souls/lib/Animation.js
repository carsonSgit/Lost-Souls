import Timer from "./Timer.js";

export default class Animation {
	/**
	 * Animations can be achieved by simply looping through a series of
	 * frames from a sprite sheet one after the other, akin to a flip book.
	 * Uses the Timer class to flip to a new "frame" after a set interval
	 * of time has elapsed. This "frame" can be used to render different
	 * sprites in a sprite sheet.
	 *
	 * @param {array} frames The indexes that reference sprite locations in a sprite sheet.
	 * @param {number} interval Switch to the next frame after this amount of time.
	 */
	constructor(frames, interval, cycles = 0) {
		this.frames = frames;
		this.interval = interval;
		this.cycles = cycles;
		this.timer = new Timer();
		this.currentFrame = 0;
		this.timesPlayed = 0;

		this.startTimer();
	}

	update(dt) {
		// No need to update if animation is only one frame.
		if (this.frames.length === 1) {
			return;
		}

		this.timer.update(dt);
	}

	/**
	 * After each interval of time, increment the current frame number.
	 * If at the end of the array of frames, loop back to the beginning.
	 */
	startTimer() {
		this.timer.addTask(() => {
			if (this.cycles === 0 || this.timesPlayed < this.cycles) {
				this.currentFrame++;
				this.currentFrame %= this.frames.length;

				if (this.currentFrame === this.frames.length - 1) {
					this.timesPlayed++;
				}
			}
		}, this.interval);
	}

	/**
	 * @returns The frame value of the current frame. This value
	 * gets used elsewhere to index a sprite from a sprite sheet.
	 */
	getCurrentFrame() {
		return this.frames[this.currentFrame];
	}

	refresh() {
		this.currentFrame = 0;
		this.timesPlayed = 0;
	}

	isDone() {
		return this.timesPlayed === this.cycles;
	}

	isHalfwayDone() {
		return this.currentFrame >= this.frames.length / 2;
	}
}
