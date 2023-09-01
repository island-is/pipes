import assert from "node:assert";
import test from "node:test";
import { z } from "@islandis/zod";
import { createPipesContextCommand } from "./create-pipes-context-command.js";
test("can create command", ()=>{
    const command = createPipesContextCommand({
        value: z.null(),
        output: z.void(),
        implement: ()=>null
    });
    /* @ts-expect-error This should be false */ const _BLE = true;
    const _TEST = true;
    assert.strictEqual(_TEST, true);
});
test("able to run command", (_t, done)=>{
    const fn = (context, config, value)=>{
        assert.deepStrictEqual(context, {
            name: "test",
            callStack: [],
            client: null
        });
        assert.deepStrictEqual(config, {
            bravo: false
        });
        assert.strictEqual(value, null);
        done();
    };
    const command = createPipesContextCommand({
        value: z.null(),
        output: z.void(),
        implement: fn
    });
    command({
        name: "test",
        callStack: [],
        client: null
    }, {
        bravo: false
    }, null);
});
test("able to run command and get value", ()=>{
    const fn = ()=>123;
    const command = createPipesContextCommand({
        value: z.null(),
        output: z.number(),
        implement: fn
    });
    assert.deepEqual(command({
        name: "test",
        callStack: [],
        client: null
    }, {
        bravo: false
    }, null), 123);
});
test("should allow extra parameters in context and config", (_t, done)=>{
    const fn = ()=>{
        done();
    };
    const command = createPipesContextCommand({
        value: z.null(),
        output: z.void(),
        implement: fn
    });
    command({
        name: "test",
        name2: "what is this",
        callStack: [],
        client: null
    }, {
        bravo: false,
        extraConfig: false
    }, null);
});
test("should not allow extra parameters in strict mode", ()=>{
    const fn = ()=>{
    // empty on purpose - will fail before
    };
    const command = createPipesContextCommand({
        value: z.object({
            name: z.string(),
            value: z.string()
        }).strict(),
        output: z.void(),
        implement: fn
    });
    const call = ()=>{
        command({
            name: "test",
            name2: "what is this",
            callStack: [],
            client: null
        }, {
            bravo: false,
            extraConfig: false
        }, {
            name: "test",
            value: "test",
            // @ts-expect-error - This should not be allowed.
            extraValue: "what is this"
        });
    };
    assert.throws(call);
});
