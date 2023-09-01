import assert from "node:assert";
import { describe, it } from "node:test";
describe("add paramters", ()=>{
    it("add parameters", ()=>{
        const x = (value)=>value;
        const b = (_val, _val2, val3)=>x(val3);
        assert.strictEqual(b(1, 2, "what"), "what");
    });
});
