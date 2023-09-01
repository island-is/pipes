/**
 * @file Empty object type.
 */
const NeverSymbol = Symbol("Never");
/** *
 * EmptyObject
 * @desc This is just an empty object in typescript since {} can mean anything.
 * @example
 * ```ts
 * const d: EmptyObject = {};
 * const b: EmptyObject = { ble: 1 }; // This should fail.
 * ```
 */
export type EmptyObject = { [NeverSymbol]?: never };
