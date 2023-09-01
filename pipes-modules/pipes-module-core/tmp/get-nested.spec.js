import { describe, it } from "node:test";
import { expect } from "./expect.js";
describe("get nested", ()=>{
    it("level 1", ()=>{
        // @ts-expect-error wrong key
        const _TEST1 = true;
        const _TEST2 = true;
        const _TEST3 = true;
    });
    it("level 2", ()=>{
        // @ts-expect-error wrong key
        const _TEST1 = true;
        const _TEST2 = true;
        const _TEST3 = true;
        expect(true).toBe(true);
    });
    it("level 3", ()=>{
        // @ts-expect-error wrong key
        const _TEST1 = true;
        const _TEST2 = true;
        const _TEST3 = true;
        expect(true).toBe(true);
    });
});
