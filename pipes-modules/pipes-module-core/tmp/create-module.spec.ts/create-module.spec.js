import { describe, it } from "node:test";
import { createModule } from "./create-module.js";
import { expect } from "./types/expect.js";
describe("create module", ()=>{
    const createModule1 = ()=>{
        return createModule({
            name: "test",
            config: ({ z })=>({
                    allowSpaceInName: z.boolean()
                }),
            context: ({ z, fn })=>({
                    name: z.string(),
                    age: z.number(),
                    changeName: fn({
                        value: z.string(),
                        output: z.void(),
                        implement: (context, _config, value)=>{
                            context.name = value;
                        }
                    }),
                    getAge: fn({
                        output: z.number(),
                        implement: (context, _config)=>{
                            return context.age;
                        }
                    }),
                    getName: fn({
                        output: z.string(),
                        implement: (context, _config)=>{
                            return context.name;
                        }
                    })
                }),
            required: [],
            optional: []
        });
    };
    const createModule2 = ()=>{
        return createModule({
            name: "test2",
            config: ({ z })=>({
                    allowWidth: z.boolean()
                }),
            context: ({ z, fn })=>({
                    getWidth: fn({
                        output: z.number(),
                        implement: (context, _config)=>{
                            return context.age;
                        }
                    })
                }),
            required: [
                "test"
            ],
            optional: []
        });
    };
    const createModule2_optional = ()=>{
        return createModule({
            name: "test2-optional",
            config: ({ z })=>({
                    allowWidth: z.boolean()
                }),
            context: ({ z, fn })=>({
                    getWidth: fn({
                        output: z.number(),
                        implement: (context, _config)=>{
                            if (typeof context.age === "number") {
                                return context.age;
                            }
                            throw new Error(`Optional modules "test" not found`);
                        }
                    })
                }),
            required: [],
            optional: [
                "test"
            ]
        });
    };
    it("can create module", ()=>{
        const module = createModule1();
        expect(module.name).toBe("test");
        expect(module.optional).toStrictEqual([]);
        expect(module.required).toStrictEqual([]);
        expect(module.config.allowSpaceInName.parse(true)).toBe(true);
        expect(module).toBeDefined();
    });
    it("can create module with required", ()=>{
        const module = createModule2();
        expect(module.name).toBe("test2");
        expect(module.optional).toStrictEqual([]);
        expect(module.required).toStrictEqual([
            "test"
        ]);
        expect(module.config.allowWidth.parse(true)).toBe(true);
        expect(module).toBeDefined();
    });
    it("can create module with optional", ()=>{
        const module = createModule2_optional();
        expect(module.name).toBe("test2-optional");
        expect(module.optional).toStrictEqual([
            "test"
        ]);
        expect(module.required).toStrictEqual([]);
        expect(module.config.allowWidth.parse(true)).toBe(true);
        expect(module).toBeDefined();
    });
});
