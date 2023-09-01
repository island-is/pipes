import assert from "node:assert";
import { describe, it } from "node:test";
describe("combineNullUndefined", ()=>{
    it("null", ()=>{
        let test1 = null;
        // @ts-expect-error - Undefined cannot be set.
        test1 = undefined;
        let test2 = null;
        // @ts-expect-error - Undefined cannot be set.
        test2 = undefined;
        let test3 = null;
        // @ts-expect-error - Undefined cannot be set.
        test3 = undefined;
        let test4 = null;
        // @ts-expect-error - Undefined cannot be set.
        test4 = undefined;
        test4 = "wow";
        assert.ok(test4);
    });
});
