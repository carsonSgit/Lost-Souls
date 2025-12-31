export default class Tile {
    static SIZE = 16;
    // Small overlap to prevent gaps from sub-pixel rendering
    static RENDER_OVERLAP = 0.5;

    /*
    Represents one tile in a Layer and on the screen.*
    @param {number} id
    @param {array} sprites
    */
    constructor(id, sprites) {
        this.sprites = sprites;
        this.id = id;
    }

    render(x, y) {
        const sprite = this.sprites[this.id];
        if (!sprite) return;

        // Render with slight overlap to prevent gaps from scaling transforms
        const overlap = Tile.RENDER_OVERLAP;
        sprite.render(
            x * Tile.SIZE - overlap,
            y * Tile.SIZE - overlap,
            { x: (Tile.SIZE + overlap * 2) / Tile.SIZE, y: (Tile.SIZE + overlap * 2) / Tile.SIZE }
        );
    }
}