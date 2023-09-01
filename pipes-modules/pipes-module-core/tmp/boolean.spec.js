import assert from "node:assert";
import { describe, it } from "node:test";
describe("boolean", ()=>{
    it("true", ()=>{
        const _TEST = true;
        const _TEST2 = false;
        const _TEST3 = false;
        const _TEST4 = false;
        const _TEST5 = false;
        assert.strictEqual(_TEST, true);
    });
    it("false", ()=>{
        const _TEST = true;
        const _TEST2 = false;
        const _TEST3 = false;
        const _TEST4 = false;
        const _TEST5 = false;
        assert.strictEqual(_TEST, true);
    });
    it("true and false", ()=>{
        const _TEST = false;
        const _TEST2 = false;
        const _TEST3 = true;
        const _TEST4 = true;
        const _TEST5 = false;
        assert.strictEqual(_TEST, true);
    });
});
