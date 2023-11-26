export default class Fonts {
	constructor() {
		this.fonts = {};
	}

	load(fontDefinitions) {
		fontDefinitions.forEach((fontDefinition) => {
			const font = new FontFace(
				fontDefinition.name,
				`url(${fontDefinition.path})`
			);

			this.fonts[fontDefinition.name] = font;

			font.load().then(font => {
				document.fonts.add(font);
			});
		});
	}

	get(name) {
		return this.fonts[name];
	}
}
