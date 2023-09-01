import { join } from "node:path";
import { describe, it, mock } from "node:test";
import { findPnpRoot } from "@islandis/find-pnp-root";
import { getNvmVersion } from "./get-nvm-version.js";
mock.fn(findPnpRoot, ()=>join(__dirname, "test"));
describe("util-get-nvm-version", ()=>{
    it("should return version from test file", ()=>{
        // Mock getBaseDir function
        expect(getNvmVersion()).toEqual("TEST");
    });
});
