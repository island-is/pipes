/** @file boolean helpers */

/**
 * isTrueOnly
 * @desc Type helper to check if a type is true.
 * @example
 * ```ts
 * const a: isTrueOnly<true> = true;
 * const b: isTrueOnly<false> = false;
 * ```
 */
export type isTrueOnly<T> = [T] extends [true] ? true : false;

/**
 * isFalseOnly
 * @desc Type helper to check if a type is false.
 * @example
 * ```ts
 * const a: isFalseOnly<true> = false;
 * const b: isFalseOnly<false> = true;
 * ```
 */
export type isFalseOnly<T> = [T] extends [false] ? true : false;

/**
 * isTrueAndFalse
 * @desc Type helper to check if a type is true and false.
 * @example
 * ```ts
 * const a: isTrueAndFalse<true> = false;
 * const b: isTrueAndFalse<false> = false;
 * const c: isTrueAndFalse<true | false> = true;
 * ```
 */
export type isTrueAndFalse<T, X = isTrueOnly<T>, Y = isFalseOnly<T>> = T extends boolean
  ? [X, Y] extends [false, false]
    ? true
    : false
  : false;
