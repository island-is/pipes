/**
 * @file Combine null and undefined.
 */
/**
 * combineNullUndefined
 * @desc Combines null and undefined into null. Makes it easier to work with zod.
 * @example
 * ```ts
 * const a: combineNullUndefined<undefined> = null;
 * const b: combineNullUndefined<undefined |  null> = null;
 * const c: combineNullUndefined<undefined |  null | string> = null;
 * const d: combineNullUndefined<undefined |  null | string> = "hehe";
 */
export type combineNullUndefined<T> = T extends null | undefined ? null : T;
