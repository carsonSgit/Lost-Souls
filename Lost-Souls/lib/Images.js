import Graphic from "./Graphic.js";

export default class Images {
	constructor(context) {
		this.context = context;
		this.images = {};
	}

	/**
	 * Load all images and return a Promise that resolves when all are loaded.
	 * @param {Array} imageDefinitions
	 * @returns {Promise} Resolves when all images are loaded
	 */
	load(imageDefinitions) {
		const loadPromises = imageDefinitions.map((imageDefinition) => {
			const graphic = new Graphic(
				imageDefinition.path,
				imageDefinition.width,
				imageDefinition.height,
				this.context,
			);
			this.images[imageDefinition.name] = graphic;
			return graphic.loadPromise;
		});

		return Promise.all(loadPromises);
	}

	get(name) {
		return this.images[name];
	}

	render(name, x, y, width = null, height = null) {
		const image = this.get(name);

		image.render(x, y, width ?? image.width, height ?? image.height);
	}
}
