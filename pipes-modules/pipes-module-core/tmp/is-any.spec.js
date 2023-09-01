import { describe, it } from "node:test";
import { expect } from "./expect.js";
describe("isAny", ()=>{
    it("any", ()=>{
        const _TEST = 1;
        expect(_TEST).toBe(1);
    });
    it("object", ()=>{
        const _TEST = 0;
        expect(_TEST).toBe(0);
    });
});
