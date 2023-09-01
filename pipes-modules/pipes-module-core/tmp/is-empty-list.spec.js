import { describe, it } from "node:test";
import { expect } from "./expect.js";
describe("isOnlyBoolean", ()=>{
    it("boolean", ()=>{
        const _TEST = true;
        const _TEST2 = false;
        expect(_TEST).not.toBe(_TEST2);
    });
});
