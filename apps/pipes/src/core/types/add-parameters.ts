/** @file addParameters */
/**
 * addParameters
 * @desc Add two parameters to a function
 * @param {Function} fn
 * @returns {Function}
 * @example
 * const add = (a: number) => a + b;
 * const addOne: removeParameters<add> = (a) => add(a, 1);
 * addOne(2); // 3
 */
export type addParameters<fn extends (...args: any[]) => any, context, config> = fn extends (
  ...args: infer P
) => infer R
  ? // eslint-disable-next-line no-shadow
    (context: context, config: config, ...args: P) => R
  : never;
