import assert from "node:assert";
import { describe, it } from "node:test";

import type { combineNullUndefined } from "./combine-null-undefined.js";

describe("combineNullUndefined", () => {
  it("null", () => {
    type test1 = combineNullUndefined<null>;
    type test2 = combineNullUndefined<undefined>;
    type test3 = combineNullUndefined<null | undefined>;
    type test4 = combineNullUndefined<null | undefined | string>;
    let test1: test1 = null;
    // @ts-expect-error - Undefined cannot be set.
    test1 = undefined;
    let test2: test2 = null;
    // @ts-expect-error - Undefined cannot be set.
    test2 = undefined;
    let test3: test3 = null;
    // @ts-expect-error - Undefined cannot be set.
    test3 = undefined;
    let test4: test4 = null;
    // @ts-expect-error - Undefined cannot be set.
    test4 = undefined;
    test4 = "wow";
    assert.ok(test4);
  });
});
