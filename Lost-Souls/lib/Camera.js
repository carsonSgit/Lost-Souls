import Vector from "./Vector.js";

export default class Camera {
	constructor(subject, scene, viewport, zoom = 2, smoothSpeed = 0.05) {
		this.subject = subject;
		this.scene = scene;
		this.viewport = viewport;
		this.zoom = zoom;
		this.smoothSpeed = smoothSpeed;
		this.position = new Vector(0, 0);

		this.smoothSpeedX = 0.04;
		this.smoothSpeedY = 0.06;
		this.deadzoneWidth = 0.15;
		this.deadzoneHeight = 0.2;
		this.lookaheadX = 40;
		this.lookaheadY = 20;
		this.lookaheadSmooth = 0.3;
		this.currentLookahead = new Vector(0, 0);
	}

	update(dt = 1) {
		this.updateLookahead();
		const targetPosition = this.getTargetPosition();
		this.position.x += (targetPosition.x - this.position.x) * this.smoothSpeedX;
		this.position.y += (targetPosition.y - this.position.y) * this.smoothSpeedY;
	}

	updateLookahead() {
		if (!this.subject.velocity) return;

		let targetLookaheadX = 0;
		let targetLookaheadY = 0;

		if (Math.abs(this.subject.velocity.x) > 10) {
			targetLookaheadX = Math.sign(this.subject.velocity.x) * this.lookaheadX;
		}
		if (Math.abs(this.subject.velocity.y) > 50) {
			targetLookaheadY = Math.sign(this.subject.velocity.y) * this.lookaheadY;
		}

		this.currentLookahead.x += (targetLookaheadX - this.currentLookahead.x) * this.lookaheadSmooth;
		this.currentLookahead.y += (targetLookaheadY - this.currentLookahead.y) * this.lookaheadSmooth;
	}

	getTargetPosition() {
		const targetPosition = new Vector(0, 0);
		const effectiveViewportX = this.viewport.x / this.zoom;
		const effectiveViewportY = this.viewport.y / this.zoom;

		const playerCenterX = this.subject.position.x + this.subject.dimensions.x / 2;
		const playerCenterY = this.subject.position.y + this.subject.dimensions.y / 2;
		const deadzoneW = effectiveViewportX * this.deadzoneWidth;
		const deadzoneH = effectiveViewportY * this.deadzoneHeight;
		const cameraCenterX = this.position.x + effectiveViewportX / 2;
		const cameraCenterY = this.position.y + effectiveViewportY / 2;

		let targetX = this.position.x;
		let targetY = this.position.y;

		const playerOffsetX = playerCenterX - cameraCenterX;
		if (Math.abs(playerOffsetX) > deadzoneW) {
			targetX = this.position.x + playerOffsetX - Math.sign(playerOffsetX) * deadzoneW;
		}

		const playerOffsetY = playerCenterY - cameraCenterY;
		if (Math.abs(playerOffsetY) > deadzoneH) {
			targetY = this.position.y + playerOffsetY - Math.sign(playerOffsetY) * deadzoneH;
		}

		targetX += this.currentLookahead.x;
		targetY += this.currentLookahead.y;

		const maxPositionX = this.scene.x - effectiveViewportX;
		const maxPositionY = this.scene.y - effectiveViewportY;

		targetPosition.x = Math.max(0, Math.min(targetX, maxPositionX));
		targetPosition.y = Math.max(0, Math.min(targetY, maxPositionY));

		return targetPosition;
	}
}