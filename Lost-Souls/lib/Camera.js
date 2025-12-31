import Vector from "./Vector.js";

export default class Camera {
	/**
	 * The "camera" in video games boils down to a small section of the space the player can look at
	 * at any given time. The camera's position is used to translate the canvas based on where the
	 * subject currently is in the scene.
	 *
	 * @param {Object} subject The camera will follow the subject. Subject must have a position vector.
	 * @param {Vector} scene The entire space the camera can potentially look at.
	 * @param {Vector} viewport How much of the scene the player can look at at any one time.
	 * @param {number} zoom The zoom level (1 = normal, 2 = 2x zoom, etc.)
	 * @param {number} smoothSpeed The speed at which camera follows (lower = smoother/slower, 0.02-0.1 recommended)
	 */
	constructor(subject, scene, viewport, zoom = 2, smoothSpeed = 0.05) {
		this.subject = subject;
		this.scene = scene;
		this.viewport = viewport;
		this.zoom = zoom;
		this.smoothSpeed = smoothSpeed;
		this.position = new Vector(0, 0);
	}

	update(dt = 1) {
		const targetPosition = this.getTargetPosition();

		// Smooth camera movement using lerp
		// Lower smoothSpeed = smoother/slower following
		const lerpSpeed = this.smoothSpeed;

		this.position.x += (targetPosition.x - this.position.x) * lerpSpeed;
		this.position.y += (targetPosition.y - this.position.y) * lerpSpeed;
	}

	/**
	 * Calculate the target camera position to center the subject in the viewport.
	 * Clamps to scene boundaries.
	 */
	getTargetPosition() {
		const targetPosition = new Vector(0, 0);

		// Calculate effective viewport size accounting for zoom
		const effectiveViewportX = this.viewport.x / this.zoom;
		const effectiveViewportY = this.viewport.y / this.zoom;

		// Center the subject in the viewport for X axis
		const targetX = this.subject.position.x + this.subject.dimensions.x / 2 - effectiveViewportX / 2;
		const maxPositionX = this.scene.x - effectiveViewportX;
		targetPosition.x = Math.max(0, Math.min(targetX, maxPositionX));

		// Center the subject in the viewport for Y axis
		const targetY = this.subject.position.y + this.subject.dimensions.y / 2 - effectiveViewportY / 2;
		const maxPositionY = this.scene.y - effectiveViewportY;
		targetPosition.y = Math.max(0, Math.min(targetY, maxPositionY));

		return targetPosition;
	}
}