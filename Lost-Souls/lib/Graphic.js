export default class Graphic {
	/**
	 * A wrapper for creating/loading a new Image() object.
	 *
	 * @param {String} path
	 * @param {Number} width
	 * @param {Number} height
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
	 */
	constructor(path, width, height, context) {
		this.image = new Image(width, height);
		this.width = width;
		this.height = height;
		this.context = context;
		this.loaded = false;

		// Create a Promise that resolves when the image loads
		this.loadPromise = new Promise((resolve, reject) => {
			this.image.onload = () => {
				this.loaded = true;
				resolve(this);
			};
			this.image.onerror = () => {
				console.error(`Failed to load image: ${path}`);
				reject(new Error(`Failed to load image: ${path}`));
			};
		});

		// Set src after handlers to ensure they catch the load event
		this.image.src = path;
	}

	render(x, y, width = this.width, height = this.height) {
		// Only render if image is loaded
		if (this.loaded) {
			this.context.drawImage(this.image, x, y, width, height);
		}
	}
}
