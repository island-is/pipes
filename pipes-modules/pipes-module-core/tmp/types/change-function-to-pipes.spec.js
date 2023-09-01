import assert from "node:assert";
import { describe, it } from "node:test";
describe("change-function-to-pipes", ()=>{
    it("should change function to pipes", ()=>{
        const customFunction = (a, b)=>a + b;
        /** @ts-expect-error - Cannot define this */ const _test1 = customFunction;
        customFunction._isPipesCommand = true;
        /** @ts-expect-error -This still returns an error */ const _test2 = customFunction;
        // Forced conversion works!
        const _test3 = customFunction;
        assert.ok(customFunction);
    });
});
