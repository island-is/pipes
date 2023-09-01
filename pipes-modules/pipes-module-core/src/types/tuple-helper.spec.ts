import { describe, it } from "node:test";

import { expect } from "./expect.js";

import type { isTuple } from "./tuple-helper.js";

describe("tuplehelper", () => {
  it("fail", () => {
    type Test = isTuple<string>;
    type Test2 = isTuple<string | number>;
    type Test3 = isTuple<string[]>;
    const _TEST: Test = false;
    const _TEST2: Test2 = false;
    const _TEST3: Test3 = false;
    expect(_TEST).toBe(_TEST2);
    expect(_TEST).toBe(_TEST3);
  });
  it("true", () => {
    type Test = isTuple<[string, number]>;
    const _TEST: Test = true;
    expect(_TEST).toBe(true);
  });
});
