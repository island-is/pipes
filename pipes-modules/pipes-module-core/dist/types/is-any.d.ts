import type { If } from "ts-toolbelt/out/Any/If.js";
import type { Is } from "ts-toolbelt/out/Any/Is.js";
export type isAny<T> = If<Is<T, any, "equals">, 1, 0>;
