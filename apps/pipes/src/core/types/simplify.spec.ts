import { describe, it } from "node:test";

import { expect } from "./expect.js";

import type { Simplify } from "./simplify.js";

describe("simplify", () => {
  it("simplify", () => {
    interface SomeInterface {
      foo: number;
      bar?: string;
      baz: number | undefined;
    }

    type SomeType = {
      fooew: number;
      bar?: string;
      bazdqdq: number | undefined;
    };

    type Literal = SomeInterface & SomeType;
    // This tests nothing, should just fail to compile.
    type _simpled = Simplify<Literal>;
    expect(true).toBe(true);
  });
});
