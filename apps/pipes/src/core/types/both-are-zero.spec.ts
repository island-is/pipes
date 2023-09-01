import assert from "node:assert";
import { describe, it } from "node:test";

import type { bothAreZero, ifIsNotZero } from "./both-are-zero.js";

describe("both-are-zero", () => {
  describe("bothAreZero", () => {
    it("should return true when both are 0", () => {
      type _RESULT = bothAreZero<0, 0>;
      const RESULT: _RESULT = true;
      assert.strictEqual(RESULT, true);
    });

    it("should return false when only first number is 0", () => {
      type _RESULT = bothAreZero<0, 1>;
      const RESULT: _RESULT = false;
      assert.strictEqual(RESULT, false);
    });

    it("should return false when only second number is 0", () => {
      type _RESULT = bothAreZero<1, 0>;
      const RESULT: _RESULT = false;
      assert.strictEqual(RESULT, false);
    });

    it("should return false when both numbers are not 0", () => {
      type _RESULT = bothAreZero<1, 1>;
      const RESULT: _RESULT = false;
      assert.strictEqual(RESULT, false);
    });
  });

  describe("ifIsNotZero", () => {
    it("should return 'If' when the number is not 0", () => {
      type _RESULT = ifIsNotZero<1, "If", "Else">;
      const RESULT: _RESULT = "If";
      assert.strictEqual(RESULT, "If");
    });

    it("should return 'Else' when the number is 0", () => {
      type _RESULT = ifIsNotZero<0, "If", "Else">;
      const RESULT: _RESULT = "Else";
      assert.strictEqual(RESULT, "Else");
    });
  });
});
