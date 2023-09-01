import { describe, it } from "node:test";

import { expect } from "./expect.js";

import type { removeParameters } from "./remove-parameters.js";

describe("remove paramters", () => {
  it("remove parameters", () => {
    const x = (_context: number, _config: number, value: string) => value;
    type X = typeof x;
    type Y = removeParameters<X>;
    const b: Y = (value) => x(1, 2, value);
    expect(b("what")).toBe("what");
    expect(true).toBe(true);
  });
});
