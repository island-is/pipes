import { describe, it } from "node:test";
import { expect } from "./expect.js";
import { isPipesContextCommand } from "./pipes-command.js";
describe("dagger context command", ()=>{
    it("fails on function", ()=>{
        const ble = ()=>{};
        expect(isPipesContextCommand(ble)).toBe(false);
    });
    it("true on dagger function", ()=>{
        const ble = ()=>{};
        ble._isPipesCommand = true;
        expect(isPipesContextCommand(ble)).toBe(true);
    });
});
