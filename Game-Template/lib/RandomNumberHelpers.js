export const getRandomNumber = (min, max) => (Math.random() * (max - min) + min) * (Math.random() < 0.5 ? -1 : 1);

export const getRandomPositiveNumber = (min, max) => (Math.random() * (max - min) + min);

export const getRandomNegativeNumber = (min, max) => (Math.random() * (max - min) + min) * -1;

export const getRandomPositiveInteger = (min, max) => Math.floor((Math.random() * (max - min + 1))) + min;

export const pickRandomElement = (list) => list[getRandomPositiveInteger(0, list.length - 1)];

/**
 * Only works for % values >= 1.
 * For chances < 1/100, use oneInX().
 *
 * @returns True chance% of the time.
 */
export const didSucceedPercentChance = (chance) => getRandomPositiveInteger(1, 100) <= chance * 100;

/**
 * @returns True one time out of X.
 */
export const oneInXChance = (x) => getRandomPositiveInteger(1, x) === 1;
