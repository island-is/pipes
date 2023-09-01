/**
 * removeParameters
 * @desc Removes two parameters from a function
 * @param {Function} fn
 * @returns {Function}
 * @example
 * const add = (a: number, b: number = 1) => a + b;
 * const addOne: removeParameters<add> = (a) => add(a, 1);
 * addOne(2); // 3
 */ export { };
