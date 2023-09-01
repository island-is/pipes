import { describe, it } from "node:test";
import { expect } from "./expect.js";
describe("maybe", ()=>{
    it("maybe", ()=>{
        const WORKS = true;
        expect(WORKS).toBe(true);
    });
});
