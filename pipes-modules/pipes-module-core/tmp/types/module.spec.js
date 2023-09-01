import { describe, it } from "node:test";
import { expect } from "./expect.js";
describe("module types", ()=>{
    describe("ModuleConfig", ()=>{
        it("if no merge is provided it should be the same as the incoming config", ()=>{
            expect(true).toBe(true);
        });
        it("if a merge is provided it should include all keys in incoming config", ()=>{
            expect(true).toBe(true);
        });
    });
    describe("ModuleContext", ()=>{
        it("OutsideInterface should have same keys as ContextInterface", ()=>{
            expect(true).toBe(true);
        });
        it("OutsideInterface can have different values than ContextInterface", ()=>{
            expect(true).toBe(true);
        });
        it("Implement should have same keys as ContextInterface", ()=>{
            expect(true).toBe(true);
        });
    });
    describe("MergeState", ()=>{
        it("One with no required or optional", ()=>{
            const _test = {
                baby: true,
                dontHurtMe: "ohno"
            };
            expect(_test.baby).toBe(true);
        });
        it("One with required", ()=>{
            const _TESTTEST = true;
            const _test = {
                baby: true,
                dontHurtMe: "ohno",
                wohoho: true
            };
            expect(_test.baby).toBe(true);
            expect(_TESTTEST).toBe(true);
        });
        it("One with optional", ()=>{
            const _TESTTEST = true;
            const _test = {
                baby: true,
                dontHurtMe: "ohno"
            };
            _test.wohoho = true;
            expect(_test.baby).toBe(true);
        });
        it("One with optional and required", ()=>{
            const _TESTTEST = true;
            const _test = {
                baby: true,
                dontHurtMe: "ohno",
                wohoho: true
            };
            _test.wohoho = true;
            _test.newHit = "no an oldie";
            expect(_test.baby).toBe(true);
        });
    });
    describe("Create module", ()=>{
        it("Create module with no required or optional modules", ()=>{
            const _NAME_TEST = true;
            const _CONFIG_TEST = true;
            const _DEFINITION_TEST = true;
            const Obj = {};
            /** @ts-expect-error - We cannot use normal function here. */ Obj.getName = (context, config, value)=>{
                const _BLE = true;
                return "wow this works";
            };
            expect(true).toBe(true);
        });
        it("create module with required module", ()=>{
            const _NAME_TEST = true;
            const _CONFIG_TEST = true;
            const _DEFINITION_TEST = true;
            const Obj = {};
            /** @ts-expect-error - We cannot use normal function here. */ Obj.getName = (context, config, value)=>{
                const _BLE = true;
                return "wow this works";
            };
            expect(true).toBe(true);
        });
        it("create module with optional module", ()=>{
            const _NAME_TEST = true;
            const _CONFIG_TEST = true;
            const _DEFINITION_TEST = true;
            const Obj = {};
            /** @ts-expect-error - Cannot assign function like this */ Obj.getRocks = (context, config)=>{
                const _BLE = true;
            };
            expect(true).toBe(true);
        });
        it("create module with required modules", ()=>{
            const _NAME_TEST = true;
            const _CONFIG_TEST = true;
            const _DEFINITION_TEST = true;
            const Obj = {};
            /** @ts-expect-error - Cannot assign function like this */ Obj.getRocks = (context, config)=>{
                const _BLE = true;
            };
            expect(true).toBe(true);
        });
        it("create module with optional modules", ()=>{
            const _NAME_TEST = true;
            const _CONFIG_TEST = true;
            const _DEFINITION_TEST = true;
            const Obj = {};
            /** @ts-expect-error - Cannot assign function like this */ Obj.getRocks = (context, config)=>{
                const _BLE = true;
            };
            expect(true).toBe(true);
        });
    });
});
