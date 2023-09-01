/**
 * isTuple
 * @desc Type helper to check if a type is a tuple.
 * @example
 * ```ts
 * const a: isTuple<[string, number]> = true;
 * const b: isTuple<string> = false;
 * ```
 */

export type isTuple<T> = T extends [infer _X, ...infer _XS] ? true : false;
