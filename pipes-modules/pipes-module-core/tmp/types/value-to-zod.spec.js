import { describe, it } from "node:test";
import { z } from "@islandis/zod";
import { expect } from "./expect.js";
describe("valueToZod", ()=>{
    it("any", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
    it("unknown and never", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
    it("string literal", ()=>{
        const _Test = z.union([
            z.literal("hehe"),
            z.literal("haha")
        ]).default("hehe");
        expect(_Test.parse(undefined)).toBe("hehe");
    });
    it("number literal", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
    it("boolean literal", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
    it("string", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
    it("number", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
    it("boolean", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
    it("null/undefined", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
    it("date", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
    it("tuple", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
    it("array", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
    it("object", ()=>{
        const _TEST = true;
        expect(_TEST).toBe(true);
    });
});
