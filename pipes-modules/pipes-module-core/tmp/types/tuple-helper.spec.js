import { describe, it } from "node:test";
import { expect } from "./expect.js";
describe("tuplehelper", ()=>{
    it("fail", ()=>{
        const _TEST = false;
        const _TEST2 = false;
        const _TEST3 = false;
        expect(_TEST).toBe(_TEST2);
        expect(_TEST).toBe(_TEST3);
    });
    it("true", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
});
