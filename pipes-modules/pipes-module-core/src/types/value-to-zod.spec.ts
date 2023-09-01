import { describe, it } from "node:test";

import {
  type ZodArray,
  type ZodBoolean,
  type ZodDate,
  type ZodDefault,
  type ZodLiteral,
  type ZodNull,
  type ZodNumber,
  type ZodObject,
  type ZodOptional,
  type ZodString,
  type ZodTuple,
  type ZodType,
  type ZodUnion,
  z,
} from "@island.is/zod";

import { expect } from "./expect.js";

import type { valueToZod } from "./value-to-zod.js";
import type { If } from "ts-toolbelt/out/Any/If.js";
import type { Is } from "ts-toolbelt/out/Any/Is.js";

describe("valueToZod", () => {
  it("any", () => {
    type Obj = valueToZod<any>;
    type Test = If<Is<Obj, never, "equals">, true, false>;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
  it("unknown and never", () => {
    type Obj = valueToZod<unknown>;
    type Obj2 = valueToZod<never>;
    type Test1 = If<Is<Obj, never, "equals">, true, false>;
    type Test2 = If<Is<Obj2, never, "equals">, true, false>;
    type Test = Test1 & Test2;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
  it("string literal", () => {
    type Obj = valueToZod<"hehe" | "haha">;
    const _Test: Obj = z.union([z.literal("hehe"), z.literal("haha")]).default("hehe");
    expect(_Test.parse(undefined)).toBe("hehe");
  });
  it("number literal", () => {
    type Obj = valueToZod<12 | 22>;
    type Test = If<Is<Obj, ZodDefault<ZodUnion<[ZodLiteral<12>, ZodLiteral<22>]>>, "<-extends">, true, false>;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
  it("boolean literal", () => {
    type Obj1 = valueToZod<true>;
    type Obj2 = valueToZod<false>;
    type Obj3 = valueToZod<false | true>;
    type Test1 = If<Is<Obj1, ZodLiteral<true>, "<-extends">, true, false>;
    type Test2 = If<Is<Obj2, ZodLiteral<false>, "<-extends">, true, false>;
    type Test3 = If<Is<Obj3, ZodBoolean, "<-extends">, true, false>;
    type Test = Test1 & Test2 & Test3;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
  it("string", () => {
    type Obj = valueToZod<string>;
    type Test = If<Is<Obj, ZodString, "<-extends">, true, false>;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
  it("number", () => {
    type Obj = valueToZod<number>;
    type Test = If<Is<Obj, ZodNumber, "<-extends">, true, false>;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
  it("boolean", () => {
    type Obj = valueToZod<boolean>;
    type Test = If<Is<Obj, ZodBoolean, "<-extends">, true, false>;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
  it("null/undefined", () => {
    type Obj = valueToZod<null | undefined>;
    type Obj2 = valueToZod<null | undefined | string>;
    type Obj3 = valueToZod<string | null | undefined>;
    type Test1 = If<Is<Obj, ZodNull, "<-extends">, true, false>;
    type Test2 = If<Is<Obj2, ZodOptional<ZodString>, "<-extends">, true, false>;
    type Test3 = If<Is<Obj3, ZodOptional<ZodString>, "<-extends">, true, false>;
    type Test = Test1 & Test2 & Test3;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
  it("date", () => {
    type Obj = valueToZod<Date>;
    type Test = If<Is<Obj, ZodDate, "<-extends">, true, false>;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
  it("tuple", () => {
    type Obj = valueToZod<[string, number, string, string, string, string]>;
    type Test = If<
      Is<Obj, ZodTuple<[ZodString, ZodNumber, ZodString, ZodString, ZodString, ZodString]>, "<-extends">,
      true,
      false
    >;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
  it("array", () => {
    type Obj = valueToZod<string[]>;
    type Test = If<Is<Obj, ZodDefault<ZodArray<ZodString, "many">>, "<-extends">, true, false>;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
  it("object", () => {
    type Obj = { name: string };
    type Obj2 = valueToZod<Obj>;
    type Test1 = If<Is<Obj2, ZodObject<{ name: ZodString }>, "<-extends">, true, false>;
    type Test2 = If<Is<Obj2, ZodType<Obj>, "<-extends">, true, false>;
    type Test = Test1 & Test2;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
});
