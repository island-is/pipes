import type { combineNullUndefined } from "./combine-null-undefined.js";
import type { isEmptyList } from "./is-empty-list.js";
import type { Length } from "ts-toolbelt/out/List/Length.js";
import type { List } from "ts-toolbelt/out/List/List.js";
import type { Exclude } from "ts-toolbelt/out/Union/Exclude.js";
import type { ListOf } from "ts-toolbelt/out/Union/ListOf.js";
type LiteralToArray<T> = ListOf<T>;
export type hasManyItems<InitalType, T = combineNullUndefined<InitalType>, ListArray extends List<any> = LiteralToArray<T>, ListLength = Length<ListArray>, IsModuleName extends boolean = InitalType extends string & {
    __type: "modulename";
} ? true : false, Bool = isEmptyList<LiteralToArray<Exclude<T, boolean>>>> = IsModuleName extends true ? false : Bool extends true ? false : ListLength extends 1 ? false : true;
export {};
