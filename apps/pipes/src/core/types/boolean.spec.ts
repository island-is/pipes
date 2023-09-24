import assert from "node:assert";
import { describe, it } from "node:test";

import type { isFalseOnly, isTrueAndFalse, isTrueOnly } from "./boolean.js";

describe("boolean", () => {
  it("true", () => {
    type T = isTrueOnly<true>;
    type F = isTrueOnly<false>;
    type E = isTrueOnly<boolean>;
    type X = isTrueOnly<true | false>;
    type D = isTrueOnly<true | number>;
    const _TEST: T = true;
    const _TEST2: F = false;
    const _TEST3: E = false;
    const _TEST4: X = false;
    const _TEST5: D = false;
    assert.strictEqual(_TEST, true);
  });
  it("false", () => {
    type T = isFalseOnly<false>;
    type F = isFalseOnly<true>;
    type E = isFalseOnly<boolean>;
    type X = isFalseOnly<true | false>;
    type D = isFalseOnly<true | number>;
    const _TEST: T = true;
    const _TEST2: F = false;
    const _TEST3: E = false;
    const _TEST4: X = false;
    const _TEST5: D = false;
    assert.strictEqual(_TEST, true);
  });
  it("true and false", () => {
    type T = isTrueAndFalse<false>;
    type F = isTrueAndFalse<true>;
    type E = isTrueAndFalse<boolean>;
    type X = isTrueAndFalse<true | false>;
    type D = isTrueAndFalse<true | number>;
    const _TEST: T = false;
    const _TEST2: F = false;
    const _TEST3: E = true;
    const _TEST4: X = true;
    const _TEST5: D = false;
    assert.strictEqual(_TEST, false);
  });
});
