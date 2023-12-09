/**
 * Uses delta time passed in from our game loop to keep track of individual
 * tasks over a given period of time. You can specify an action to be done at
 * each interval of time, and/or only once after a duration. There is also a tween
 * function that makes use of the timer mechanism to interpolate a value between
 * a start and end value.
 */
export default class Timer {
	constructor() {
		this.tasks = [];
	}

	update(dt) {
		this.updateTasks(dt)
		this.removeFinishedTasks();
	}

	/**
	 * Adds a task to the timer's list of tasks to be run.
	 *
	 * @param {function} action The function to execute after a certain period of time.
	 * @param {number} interval How often the action should execute (frequency).
	 * @param {number} duration How long the task will be tracked in this.tasks.
	 * @param {function} callback The function to execute after duration has passed.
	 * @returns The task that was just added to the tasks list.
	 */
	addTask(action, interval, duration = 0, callback = () => { }) {
		const task = new Task(action, interval, duration, callback);

		this.tasks.push(task);

		return task;
	}

	/**
	 * Loops through the tasks and updates them accordingly based on delta time.
	 *
	 * @param {number} dt How much time has elapsed since the last time this was called.
	 */
	updateTasks(dt) {
		this.tasks.forEach((task) => {
			task.update(dt);
		});
	}

	/**
	 * Removes the finished tasks by looping through each tasks and checking the isDone flag.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
	 */
	removeFinishedTasks() {
		this.tasks = this.tasks.filter(task => !task.isDone);
	}

	clear() {
		this.tasks = [];
	}

	/**
	 * Interpolate a value until a specified value is reached over a specified period of time in seconds.
	 *
	 * @param {object} object An object that has at least one numerical property to interpolate.
	 * @param {array} parameters The properties of the object to interpolate (as strings).
	 * @param {array} endValues The final numerical values the parameters should reach.
	 * @param {number} duration How long the interpolation should take.
	 * @param {function} callback The function to execute after duration has passed.
	 */
	tween(object, parameters, endValues, duration, callback = () => { }) {
		// const startingValues = JSON.parse(JSON.stringify(object)); // Remove extra parameters (ex. prototype).
		const startingValues = Object.assign({}, object);

		this.addTask((time) => {
			parameters.forEach((parameter, index) => {
				// Calculate the direction in case we have to tween values from high to low.
				const direction = endValues[index] - object[parameter] > 0 ? 1 : -1;
				const startValue = startingValues[parameter];
				const endValue = endValues[index];
				const scaleRatio = time / duration;
				const currentValue = startValue + ((endValue - startValue) * scaleRatio);

				if (direction === 1) {
					object[parameter] = Math.min(endValue, currentValue);
				}
				else {
					object[parameter] = Math.max(endValue, currentValue);
				}
			});
		}, 0, duration, callback);
	}

	async tweenAsync(object, parameters, endValues, duration) {
		return new Promise((resolve) => {
			this.tween(object, parameters, endValues, duration, resolve);
		});
	}

	wait(duration, callback = () => { }) {
		return this.addTask(() => { }, 0, duration, callback);
	}

	async waitAsync(duration) {
		return new Promise((resolve) => {
			this.addTask(() => { }, 0, duration, resolve);
		});
	}
}

class Task {
	/**
	 * Represents an action to be done after a certain period of time.
	 *
	 * @param {function} action The function to execute after a certain period of time.
	 * @param {number} interval How often the action should execute (frequency).
	 * @param {number} duration How long the task will be tracked in this.tasks.
	 * @param {function} callback The function to execute after duration has passed.
	 */
	constructor(action, interval, duration = 0, callback = () => { }) {
		this.action = action;
		this.interval = interval;
		this.intervalTimer = 0;
		this.totalTime = 0;
		this.duration = duration;
		this.callback = callback;
		this.isDone = false;
	}

	clear() {
		this.isDone = true;
	}

	update(dt) {
		this.intervalTimer += dt; // Counts from 0 until interval.
		this.totalTime += dt; // Counts from 0 until duration.

		// An interval of 0 means we're tweening.
		if (this.interval === 0) {
			this.action(this.totalTime);
		}
		// Otherwise, at every interval, execute the action.
		else if (this.intervalTimer >= this.interval) {
			this.intervalTimer = 0;
			this.action(dt);
		}

		// At the end of the duration, execute the callback.
		if (this.duration !== 0 && this.totalTime >= this.duration) {
			this.callback();
			this.isDone = true;
		}
	}
}
