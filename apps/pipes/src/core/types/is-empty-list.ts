import type { Length } from "ts-toolbelt/out/List/Length.js";
import type { List } from "ts-toolbelt/out/List/List.js";
import type { Exclude } from "ts-toolbelt/out/Union/Exclude.js";

/**
 * isEmptyList
 * @desc Returns true if the type is an empty list.
 * @example
 * ```ts
 * const EmptyList: isEmptyList<[]> = true;
 * const NotEmptyList: isEmptyList<[1]> = false;
 * ```
 */
export type isEmptyList<
  T extends List<any>,
  X extends List<any> = Exclude<T, boolean>,
  XLength = Length<X>,
> = XLength extends 0 ? true : false;
