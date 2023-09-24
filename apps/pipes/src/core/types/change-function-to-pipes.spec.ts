import assert from "node:assert";
import { describe, it } from "node:test";

import type { changeFunctionToPipes } from "./change-function-to-pipes.js";

describe("change-function-to-pipes", () => {
  it("should change function to pipes", () => {
    type CustomFunctionType = {
      (a: number, b: number): number;
    };
    const customFunction: CustomFunctionType = (a, b) => a + b;
    /** @ts-expect-error - Cannot define this */
    const _test1: changeFunctionToPipes<typeof customFunction> = customFunction;
    (customFunction as any)._isPipesCommand = true;
    /** @ts-expect-error -This still returns an error */
    const _test2: changeFunctionToPipes<typeof customFunction> = customFunction;
    // Forced conversion works!
    const _test3: changeFunctionToPipes<typeof customFunction> = customFunction as any;
    assert.ok(customFunction);
  });
});
