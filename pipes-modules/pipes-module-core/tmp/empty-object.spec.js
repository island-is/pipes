/* eslint-disable unused-imports/no-unused-vars */ import assert from "node:assert";
import { describe, it } from "node:test";
describe("empty object", ()=>{
    it("test", ()=>{
        const d = {};
        // @ts-expect-error - This should fail.
        const x = {
            ble: 1
        };
        assert.ok(true);
    });
});
