import type { If } from "ts-toolbelt/out/Any/If.js";
import type { Is } from "ts-toolbelt/out/Any/Is.js";

/**
 * isAny
 * @desc Typescript type for any.
 * @example
 * ```ts
 * const a: isAny<any> = true;
 * const b: isAny<string> = false;
 */
export type isAny<T> = If<Is<T, any, "equals">, 1, 0>;
