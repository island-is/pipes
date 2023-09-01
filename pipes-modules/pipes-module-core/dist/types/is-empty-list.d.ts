import type { Length } from "ts-toolbelt/out/List/Length.js";
import type { List } from "ts-toolbelt/out/List/List.js";
import type { Exclude } from "ts-toolbelt/out/Union/Exclude.js";
export type isEmptyList<T extends List<any>, X extends List<any> = Exclude<T, boolean>, XLength = Length<X>> = XLength extends 0 ? true : false;
