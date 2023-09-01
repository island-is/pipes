import assert from "node:assert";
import test from "node:test";

import { z } from "./zod.js";

test("env from string", () => {
  process.env.TEST = "hehe";
  const value = z.string().default(undefined, { env: "TEST" }).parse(undefined);
  assert.strictEqual(value, "hehe");
});
test("env from number", () => {
  process.env.TEST = "12";
  const value = z.number().default(undefined, { env: "TEST" }).parse(undefined);
  assert.strictEqual(value, 12);
});
test("env from literal", () => {
  process.env.TEST = "wow";
  const value = z.literal("wow").default(undefined, { env: "TEST" }).parse(undefined);
  assert.strictEqual(value, "wow");
});
test("env from boolean", () => {
  process.env.TEST = "true";
  process.env.TEST2 = "false";
  const value = z.boolean().default(undefined, { env: "TEST" }).parse(undefined);
  const value2 = z.boolean().default(undefined, { env: "TEST2" }).parse(undefined);
  assert.strictEqual(value, true);
  assert.strictEqual(value2, false);
});
test("env from array of string", () => {
  process.env.TEST = "wow,hehe";
  const value = z.array(z.string()).default(undefined, { env: "TEST" }).parse(undefined);
  assert.strictEqual(value[0], "wow");
  assert.strictEqual(value[1], "hehe");
});
test("env from array of number", () => {
  process.env.TEST = "12,13";
  const value = z.array(z.number()).default(undefined, { env: "TEST" }).parse(undefined);
  assert.strictEqual(value[0], 12);
  assert.strictEqual(value[1], 13);
});
test("env from array of boolean", () => {
  process.env.TEST = "true,false";
  const value = z.array(z.boolean()).default(undefined, { env: "TEST" }).parse(undefined);
  assert.strictEqual(value[0], true);
  assert.strictEqual(value[1], false);
});
test("env from union of literal", () => {
  process.env.TEST = "wow";
  process.env.TEST2 = "hehe";
  const value = z
    .union([z.literal("wow"), z.literal("hehe")])
    .default(undefined, { env: "TEST" })
    .parse(undefined);
  const value2 = z
    .union([z.literal("wow"), z.literal("hehe")])
    .default(undefined, { env: "TEST2" })
    .parse(undefined);
  assert.strictEqual(value, "wow");
  assert.strictEqual(value2, "hehe");
});
test("arg from string", () => {
  process.argv = ["", "", "--TEST", "wow"];
  const value = z
    .string()
    .default("normal", { arg: { long: "TEST" } })
    .parse(undefined);
  assert.strictEqual(value, "wow");
});
test("arg from number", () => {
  process.argv = ["", "", "--TEST", "12"];
  const value = z
    .number()
    .default(0, { arg: { long: "TEST" } })
    .parse(undefined);
  assert.strictEqual(value, 12);
});
test("arg from literal", () => {
  process.argv = ["", "", "--TEST", "wow"];
  const value = z
    .literal("wow")
    .default(undefined, { arg: { long: "TEST" } })
    .parse(undefined);
  assert.strictEqual(value, "wow");
});
test("arg from boolean", () => {
  process.argv = ["", "", "--TEST"];
  const value = z
    .boolean()
    .default(false, { arg: { long: "TEST" } })
    .parse(undefined);
  const value2 = z
    .boolean()
    .default(false, { arg: { long: "TEST2" } })
    .parse(undefined);
  assert.strictEqual(value, true);
  assert.strictEqual(value2, false);
});
test("arg from array of string", () => {
  process.argv = ["", "", "--TEST", "wow", "--TEST", "hehe"];
  const value = z
    .array(z.string())
    .default([], { arg: { long: "TEST" } })
    .parse(undefined);
  assert.strictEqual(value[0], "wow");
  assert.strictEqual(value[1], "hehe");
});
test("arg from array of number", () => {
  process.argv = ["", "", "--TEST", "12", "--TEST", "13"];
  const value = z
    .array(z.number())
    .default([], { arg: { long: "TEST" } })
    .parse(undefined);
  assert.strictEqual(value[0], 12);
  assert.strictEqual(value[1], 13);
});
test("arg from array of boolean", () => {
  process.argv = ["", "", "--TEST"];
  const value = z
    .array(z.boolean())
    .default([], { arg: { long: "TEST" } })
    .parse(undefined);
  assert.strictEqual(value[0], true);
});
test("arg from union of literal", () => {
  process.argv = ["", "", "--TEST", "wow", "--TEST2", "hehe"];
  const value = z
    .union([z.literal("wow"), z.literal("hehe"), z.literal("normal")])
    .default("normal", { arg: { long: "TEST" } })
    .parse(undefined);
  const value2 = z
    .union([z.literal("wow"), z.literal("hehe"), z.literal("normal")])
    .default("normal", { arg: { long: "TEST2" } })
    .parse(undefined);
  assert.strictEqual(value, "wow");
  assert.strictEqual(value2, "hehe");
});

test("string from positional", () => {
  process.argv = ["", "", "wow"];
  const value = z
    .string()
    .default("normal", { arg: { long: "TEST", positional: true } })
    .parse(undefined);
  assert.strictEqual(value, "wow");
});

test("literal from positional", () => {
  process.argv = ["", "", "wow"];
  const value = z
    .union([z.literal("what"), z.literal("wow")])
    .default("what", { arg: { long: "TEST", positional: true } })
    .parse(undefined);
  assert.strictEqual(value, "wow");
});

test("number from positional", () => {
  process.argv = ["", "", "1"];
  const value = z
    .number()
    .default(2, { arg: { long: "TEST", positional: true } })
    .parse(undefined);
  assert.strictEqual(value, 1);
});
