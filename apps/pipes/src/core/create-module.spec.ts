import { describe, it } from "node:test";

import { createModule } from "./create-module.js";
import { expect } from "./types/expect.js";

import type { createModuleDef } from "./create-module.js";

describe("create module", () => {
  interface ModuleContext1 {
    age: number;
    name: string;
    getName: () => string;
    getAge: () => number;
    changeName: (name: string) => void;
  }
  interface ModuleConfig1 {
    allowSpaceInName: boolean;
  }
  type Module1 = createModuleDef<"test", ModuleContext1, ModuleConfig1>;
  interface ModuleContext2 {
    getWidth: () => number;
  }
  interface ModuleConfig2 {
    allowWidth: boolean;
  }
  type Module2 = createModuleDef<"test2", ModuleContext2, ModuleConfig2, [Module1]>;
  type Module2_optional = createModuleDef<"test2-optional", ModuleContext2, ModuleConfig2, [], [Module1]>;
  const createModule1 = () => {
    return createModule<Module1>({
      name: "test",
      config: ({ z }): Module1["Config"]["Implement"] => ({
        allowSpaceInName: z.boolean(),
      }),
      context: ({ z, fn }): Module1["Context"]["Implement"] => ({
        name: z.string(),
        age: z.number(),
        changeName: fn<string, void>({
          value: z.string(),
          output: z.void(),
          implement: (context, _config, value) => {
            context.name = value;
          },
        }),
        getAge: fn<undefined, number>({
          output: z.number(),
          implement: (context, _config) => {
            return context.age;
          },
        }),
        getName: fn<undefined, string>({
          output: z.string(),
          implement: (context, _config) => {
            return context.name;
          },
        }),
      }),
      required: [],
      optional: [],
    });
  };
  const createModule2 = () => {
    return createModule<Module2>({
      name: "test2",
      config: ({ z }): Module2["Config"]["Implement"] => ({
        allowWidth: z.boolean(),
      }),
      context: ({ z, fn }): Module2["Context"]["Implement"] => ({
        getWidth: fn<undefined, number>({
          output: z.number(),
          implement: (context, _config) => {
            return context.age;
          },
        }),
      }),
      required: ["test"],
      optional: [],
    });
  };
  const createModule2_optional = () => {
    return createModule<Module2_optional>({
      name: "test2-optional",
      config: ({ z }): Module2_optional["Config"]["Implement"] => ({
        allowWidth: z.boolean(),
      }),
      context: ({ z, fn }): Module2_optional["Context"]["Implement"] => ({
        getWidth: fn<undefined, number>({
          output: z.number(),
          implement: (context, _config) => {
            if (typeof context.age === "number") {
              return context.age;
            }
            throw new Error(`Optional modules "test" not found`);
          },
        }),
      }),
      required: [],
      optional: ["test"],
    });
  };
  it("can create module", () => {
    const module = createModule1();
    expect(module.name).toBe("test");
    expect(module.optional).toStrictEqual([]);
    expect(module.required).toStrictEqual([]);
    expect((module.config.allowSpaceInName as any).parse(true)).toBe(true);
    expect(module).toBeDefined();
  });
  it("can create module with required", () => {
    const module = createModule2();
    expect(module.name).toBe("test2");
    expect(module.optional).toStrictEqual([]);
    expect(module.required).toStrictEqual(["test"]);
    expect((module.config.allowWidth as any).parse(true)).toBe(true);
    expect(module).toBeDefined();
  });
  it("can create module with optional", () => {
    const module = createModule2_optional();
    expect(module.name).toBe("test2-optional");
    expect(module.optional).toStrictEqual(["test"]);
    expect(module.required).toStrictEqual([]);
    expect((module.config.allowWidth as any).parse(true)).toBe(true);
    expect(module).toBeDefined();
  });
});
