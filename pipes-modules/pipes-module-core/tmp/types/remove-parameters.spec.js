import { describe, it } from "node:test";
import { expect } from "./expect.js";
describe("remove paramters", ()=>{
    it("remove parameters", ()=>{
        const x = (_context, _config, value)=>value;
        const b = (value)=>x(1, 2, value);
        expect(b("what")).toBe("what");
        expect(true).toBe(true);
    });
});
