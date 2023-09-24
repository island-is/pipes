import type { isFalseOnly, isTrueAndFalse, isTrueOnly } from "./boolean.js";
import type { combineNullUndefined } from "./combine-null-undefined.js";
import type { GenericArray } from "./generic-array.js";
import type { isAny } from "./is-any.js";
import type { hasManyItems } from "./literal-convert.js";
import type { ModuleName } from "./module.js";
import type { isTuple } from "./tuple-helper.js";
import type {
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodLazy,
  ZodLiteral,
  ZodNull,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodString,
  ZodTuple,
  ZodType,
  ZodTypeAny,
  ZodUnion,
  ZodVoid,
} from "../../utils/zod/zod.js";
import type { If } from "ts-toolbelt/out/Any/If.js";
import type { Is } from "ts-toolbelt/out/Any/Is.js";
import type { IsLiteral } from "ts-toolbelt/out/Community/IsLiteral.js";
import type { Length } from "ts-toolbelt/out/List/Length.js";
import type { List } from "ts-toolbelt/out/List/List.js";
import type { ListOf } from "ts-toolbelt/out/Union/ListOf.js";

type ArrayToZod<T extends Readonly<any[]>> = { [K in keyof T]: valueToZod<T[K]> };
type ArrayToZodArray<
  U extends Readonly<List<any>>,
  AddUnion = 1,
  length extends number = Length<U>,
  head = U[0],
> = length extends 1
  ? // Only one member in array. Return head.
    valueToZod<head>
  : U extends [...infer R, null]
  ? // Array contains null or undefined. Return optional array.
    ZodOptional<ArrayToZodArray<R>> | ZodDefault<ZodOptional<ArrayToZodArray<R>>>
  : U extends [null, ...infer R]
  ? ZodOptional<ArrayToZodArray<R>> | ZodDefault<ZodOptional<ArrayToZodArray<R>>>
  : AddUnion extends 1
  ? // @ts-expect-error - Sometimes we get never here.
    ZodDefault<ZodUnion<GenericArray<ArrayToZod<U>>>>
  : ZodType<U> | ArrayToZod<U>;
type ValueToZodArray<T, AddUnion = 1, U extends List<any> = ListOf<combineNullUndefined<T>>> = ArrayToZodArray<
  U,
  AddUnion
>;

type List2Tuple<L> = L extends [infer Head, ...infer Tail]
  ? [valueToZod<Head>, ...List2Tuple<Tail>]
  : L extends [infer Head]
  ? [valueToZod<Head>]
  : [];

type zodDefault<T extends ZodTypeAny> = ZodDefault<T> | T;
type zodLazy<T extends ZodTypeAny> = ZodLazy<T> | T;

/**
 * valueToZod
 * @desc Creates a Zod type from a value.
 * @example
 * ```ts
 *  type Test = ValueToZod<{name: string}>;
 * ```
 */
export type valueToZod<T> = {
  modulename: ZodType<ModuleName> | ZodDefault<ZodType<ModuleName>>;
  // Multiple items, for example: true | null | undefined
  many: ValueToZodArray<T>;
  // Null or undefined
  nullOrUndefined: zodDefault<ZodNull> | ZodNull;
  // Boolean
  boolean: zodDefault<ZodBoolean> | ZodBoolean;
  // True literal
  true: zodDefault<ZodLiteral<true>> | ZodLiteral<true>;
  // False literal
  false: zodDefault<ZodLiteral<false>> | ZodLiteral<false>;
  // Other Literal
  literal: ZodLiteral<T>;
  // Tuple
  tuple: T extends Array<infer _U> ? ZodTuple<List2Tuple<T>> : never;
  // Array
  array: T extends Array<infer U> ? ZodArray<valueToZod<U>> | ZodDefault<ZodArray<valueToZod<U>>> : never;
  // Date
  date: zodDefault<ZodDate> | ZodDate;
  // String
  string: zodDefault<ZodString> | ZodString;
  // Number
  number: zodDefault<ZodNumber> | ZodNumber;
  // Void
  void: ZodVoid;
  // Object
  object:
    | ZodType<T>
    | zodLazy<ZodObject<{ [k in keyof T]: valueToZod<T[k]> }, "strip"> | ZodType<T>>
    | zodDefault<zodLazy<ZodObject<{ [k in keyof T]: valueToZod<T[k]> }, "strip"> | ZodType<T>>>;
  // Unknown - Fail
  unknown: never;
}[zodKey<T>];

export type valueToConfig<T> = valueToZod<T> extends zodLazy<infer X> ? (X extends ZodObject<any> ? X : never) : never;

type zodKey<T> = true extends If<isAny<T>, true>
  ? // Ignore any
    "unknown"
  : // Ignore never
  true extends If<Is<T, never, "equals">, true>
  ? "unknown"
  : // We have many items!
  true extends hasManyItems<T>
  ? "many"
  : // Null or undefined
  true extends If<Is<T, null | undefined, "extends->">, true>
  ? "nullOrUndefined"
  : // Boolean
  true extends isTrueAndFalse<T>
  ? "boolean"
  : // True Literal
  true extends isTrueOnly<T>
  ? "true"
  : // False Literal
  true extends isFalseOnly<T>
  ? "false"
  : // Module Name
  T extends string & { __type: "modulename" }
  ? "modulename"
  : // Literal
  true extends If<IsLiteral<T>, true>
  ? "literal"
  : // Array
  T extends any[]
  ? isTuple<T> extends true
    ? "tuple"
    : "array"
  : // Date
  true extends If<Is<T, Date, "equals">, true>
  ? "date"
  : // String
  true extends If<Is<T, string, "equals">, true>
  ? "string"
  : // Number
  true extends If<Is<T, number, "equals">, true>
  ? "number"
  : // Void
  true extends If<Is<T, void, "equals">, true>
  ? "void"
  : // Object
  T extends { [k: string]: any }
  ? "object"
  : "unknown";
