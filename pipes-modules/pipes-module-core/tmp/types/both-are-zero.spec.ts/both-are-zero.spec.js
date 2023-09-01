import assert from "node:assert";
import { describe, it } from "node:test";
describe("both-are-zero", ()=>{
    describe("bothAreZero", ()=>{
        it("should return true when both are 0", ()=>{
            const RESULT = true;
            assert.strictEqual(RESULT, true);
        });
        it("should return false when only first number is 0", ()=>{
            const RESULT = false;
            assert.strictEqual(RESULT, true);
        });
        it("should return false when only second number is 0", ()=>{
            const RESULT = false;
            assert.strictEqual(RESULT, true);
        });
        it("should return false when both numbers are not 0", ()=>{
            const RESULT = false;
            assert.strictEqual(RESULT, true);
        });
    });
    describe("ifIsNotZero", ()=>{
        it("should return 'If' when the number is not 0", ()=>{
            const RESULT = "If";
            assert.strictEqual(RESULT, true);
        });
        it("should return 'Else' when the number is 0", ()=>{
            const RESULT = "Else";
            assert.strictEqual(RESULT, true);
        });
    });
});
