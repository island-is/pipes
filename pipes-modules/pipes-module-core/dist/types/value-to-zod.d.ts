import type { isFalseOnly, isTrueAndFalse, isTrueOnly } from "./boolean.js";
import type { combineNullUndefined } from "./combine-null-undefined.js";
import type { GenericArray } from "./generic-array.js";
import type { isAny } from "./is-any.js";
import type { hasManyItems } from "./literal-convert.js";
import type { ModuleName } from "./module.js";
import type { isTuple } from "./tuple-helper.js";
import type { ZodArray, ZodBoolean, ZodDate, ZodDefault, ZodLazy, ZodLiteral, ZodNull, ZodNumber, ZodObject, ZodOptional, ZodString, ZodTuple, ZodType, ZodTypeAny, ZodUnion, ZodVoid } from "@island.is/zod";
import type { If } from "ts-toolbelt/out/Any/If.js";
import type { Is } from "ts-toolbelt/out/Any/Is.js";
import type { IsLiteral } from "ts-toolbelt/out/Community/IsLiteral.js";
import type { Length } from "ts-toolbelt/out/List/Length.js";
import type { List } from "ts-toolbelt/out/List/List.js";
import type { ListOf } from "ts-toolbelt/out/Union/ListOf.js";
type ArrayToZod<T extends Readonly<any[]>> = {
    [K in keyof T]: valueToZod<T[K]>;
};
type ArrayToZodArray<U extends Readonly<List<any>>, AddUnion = 1, length extends number = Length<U>, head = U[0]> = length extends 1 ? valueToZod<head> : U extends [...infer R, null] ? ZodOptional<ArrayToZodArray<R>> | ZodDefault<ZodOptional<ArrayToZodArray<R>>> : U extends [null, ...infer R] ? ZodOptional<ArrayToZodArray<R>> | ZodDefault<ZodOptional<ArrayToZodArray<R>>> : AddUnion extends 1 ? ZodDefault<ZodUnion<GenericArray<ArrayToZod<U>>>> : ZodType<U> | ArrayToZod<U>;
type ValueToZodArray<T, AddUnion = 1, U extends List<any> = ListOf<combineNullUndefined<T>>> = ArrayToZodArray<U, AddUnion>;
type List2Tuple<L> = L extends [infer Head, ...infer Tail] ? [valueToZod<Head>, ...List2Tuple<Tail>] : L extends [infer Head] ? [valueToZod<Head>] : [];
type zodDefault<T extends ZodTypeAny> = ZodDefault<T> | T;
type zodLazy<T extends ZodTypeAny> = ZodLazy<T> | T;
export type valueToZod<T> = {
    modulename: ZodType<ModuleName> | ZodDefault<ZodType<ModuleName>>;
    many: ValueToZodArray<T>;
    nullOrUndefined: zodDefault<ZodNull> | ZodNull;
    boolean: zodDefault<ZodBoolean> | ZodBoolean;
    true: zodDefault<ZodLiteral<true>> | ZodLiteral<true>;
    false: zodDefault<ZodLiteral<false>> | ZodLiteral<false>;
    literal: ZodLiteral<T>;
    tuple: T extends Array<infer _U> ? ZodTuple<List2Tuple<T>> : never;
    array: T extends Array<infer U> ? ZodArray<valueToZod<U>> | ZodDefault<ZodArray<valueToZod<U>>> : never;
    date: zodDefault<ZodDate> | ZodDate;
    string: zodDefault<ZodString> | ZodString;
    number: zodDefault<ZodNumber> | ZodNumber;
    void: ZodVoid;
    object: ZodType<T> | zodLazy<ZodObject<{
        [k in keyof T]: valueToZod<T[k]>;
    }, "strip"> | ZodType<T>> | zodDefault<zodLazy<ZodObject<{
        [k in keyof T]: valueToZod<T[k]>;
    }, "strip"> | ZodType<T>>>;
    unknown: never;
}[zodKey<T>];
export type valueToConfig<T> = valueToZod<T> extends zodLazy<infer X> ? (X extends ZodObject<any> ? X : never) : never;
type zodKey<T> = true extends If<isAny<T>, true> ? "unknown" : true extends If<Is<T, never, "equals">, true> ? "unknown" : true extends hasManyItems<T> ? "many" : true extends If<Is<T, null | undefined, "extends->">, true> ? "nullOrUndefined" : true extends isTrueAndFalse<T> ? "boolean" : true extends isTrueOnly<T> ? "true" : true extends isFalseOnly<T> ? "false" : T extends string & {
    __type: "modulename";
} ? "modulename" : true extends If<IsLiteral<T>, true> ? "literal" : T extends any[] ? isTuple<T> extends true ? "tuple" : "array" : true extends If<Is<T, Date, "equals">, true> ? "date" : true extends If<Is<T, string, "equals">, true> ? "string" : true extends If<Is<T, number, "equals">, true> ? "number" : true extends If<Is<T, void, "equals">, true> ? "void" : T extends {
    [k: string]: any;
} ? "object" : "unknown";
export {};
