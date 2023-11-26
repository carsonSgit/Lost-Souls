/**
 * Axis-Aligned Bounding Box
 *
 * One of the simpler forms of collision detection is between two rectangles that are
 * axis aligned — meaning no rotation. The algorithm works by ensuring there is no gap
 * between any of the 4 sides of the rectangles. Any gap means a collision does not exist.
 *
 * @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection#axis-aligned_bounding_box
 *
 * @param {number} x1
 * @param {number} y1
 * @param {number} width1
 * @param {number} height1
 * @param {number} x2
 * @param {number} y2
 * @param {number} width2
 * @param {number} height2
 * @returns Whether the two rectangles defined by the parameters are intersecting.
 */
export const isAABBCollision = (x1, y1, width1, height1, x2, y2, width2, height2) => x1 + width1 >= x2 && x1 <= x2 + width2 && y1 + height1 >= y2 && y1 <= y2 + height2;

/**
 * @see https://gamedev.stackexchange.com/questions/13774/how-do-i-detect-the-direction-of-2d-rectangular-object-collisions
 *
 * @returns The direction that the first rectangle collided with the second. 0: Up; 1: Down; 2: Left; 3: Right;
 */
export const getCollisionDirection = (x1, y1, width1, height1, x2, y2, width2, height2) => {
	const entityBottom = y2 + height2;
	const thisBottom = y1 + height1;
	const entityRight = x2 + width2;
	const thisRight = x1 + width1;

	const bottomCollisionDistance = thisBottom - y2;
	const topCollisionDistance = entityBottom - y1;
	const leftCollisionDistance = entityRight - x1;
	const rightCollisionDistance = thisRight - x2;

	if (topCollisionDistance < bottomCollisionDistance &&
		topCollisionDistance < leftCollisionDistance &&
		topCollisionDistance < rightCollisionDistance) {
		return 0;
	}
	if (bottomCollisionDistance < topCollisionDistance &&
		bottomCollisionDistance < leftCollisionDistance &&
		bottomCollisionDistance < rightCollisionDistance) {
		return 1;
	}
	if (leftCollisionDistance < rightCollisionDistance &&
		leftCollisionDistance < topCollisionDistance &&
		leftCollisionDistance < bottomCollisionDistance) {
		return 2;
	}
	if (rightCollisionDistance < leftCollisionDistance &&
		rightCollisionDistance < topCollisionDistance &&
		rightCollisionDistance < bottomCollisionDistance) {
		return 3;
	}
}
