import { describe, it } from "node:test";

import { expect } from "./expect.js";

import type { isAny } from "./is-any.js";

describe("isAny", () => {
  it("any", () => {
    type Test = isAny<any>;
    const _TEST: Test = 1;
    expect(_TEST).toBe(1);
  });
  it("object", () => {
    type Test = isAny<object>;
    const _TEST: Test = 0;
    expect(_TEST).toBe(0);
  });
});
