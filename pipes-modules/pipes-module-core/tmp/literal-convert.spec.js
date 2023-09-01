import { describe, it } from "node:test";
import { expect } from "./expect.js";
describe("HasManyItems", ()=>{
    it("single item: string", ()=>{
        const _TEST = false;
        expect(_TEST).toBe(false);
    });
    it("single item: number", ()=>{
        const _TEST = false;
        expect(_TEST).toBe(false);
    });
    it("single item: boolean", ()=>{
        const _TEST = false;
        expect(_TEST).toBe(false);
    });
    it("single item: boolean true", ()=>{
        const _TEST = false;
        expect(_TEST).toBe(false);
    });
    it("single item: boolean false", ()=>{
        const _TEST = false;
        expect(_TEST).toBe(false);
    });
    it("single item: object", ()=>{
        const _TEST = false;
        expect(_TEST).toBe(false);
    });
    it("only null and undefined and one object", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
    it("many: object", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
});
