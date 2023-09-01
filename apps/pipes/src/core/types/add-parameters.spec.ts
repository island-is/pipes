import assert from "node:assert";
import { describe, it } from "node:test";

import type { addParameters } from "./add-parameters.js";

describe("add paramters", () => {
  it("add parameters", () => {
    const x = (value: string) => value;
    type X = typeof x;
    type Y = addParameters<X, number, number>;
    const b: Y = (_val: number, _val2: number, val3: string) => x(val3);
    assert.strictEqual(b(1, 2, "what"), "what");
  });
});
