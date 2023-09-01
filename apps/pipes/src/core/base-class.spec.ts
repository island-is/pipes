import assert from "node:assert";
import { describe, it } from "node:test";

import { Client } from "@dagger.io/dagger";
import { when } from "mobx";

import { ContextHasModule, createInternalState, createPipesCore, createState } from "./base-class.js";
import { createConfig, createContext, createModule, type createModuleDef, createModuleName } from "./create-module.js";
import { type PipesCoreModule } from "./pipes-core-module.js";
import { expect } from "./types/expect.js";

import type { MergeModules } from "./types/module.js";

const runningState = createState();
runningState.state = "running";

/**** TEST MODULES */
interface HelloWorldModuleContext {
  hello: string;
  sayHello: () => string;
}

interface HelloWorldModuleConfig {
  shouldSayBye: boolean;
}
type HelloWorldModule = createModuleDef<"HelloWorld", HelloWorldModuleContext, HelloWorldModuleConfig>;
const HelloWorldConfig = createConfig<HelloWorldModule>(({ z }) => ({
  shouldSayBye: z.boolean().default(false),
}));
const HelloWorldContext = createContext<HelloWorldModule>(({ z, fn }) => ({
  hello: z.string().default("world!"),
  sayHello: fn<undefined, string>({
    output: z.string(),
    implement: (context, config) => {
      const world = context.hello;
      if (config.shouldSayBye) {
        return `Bye ${world}`;
      }
      return `Hello ${world}`;
    },
  }),
}));
const HelloWorld = createModule<HelloWorldModule>({
  name: "HelloWorld" as const,
  required: [],
  config: HelloWorldConfig,
  context: HelloWorldContext,
});

interface MeasurementModuleContext {
  valueA: number;
  valueB: number;
  foot: string;
  measurement: () => string;
}

interface MeasurementModuleConfig {
  measurement: string;
}
type MeasurementModule = createModuleDef<
  "Measurement",
  MeasurementModuleContext,
  MeasurementModuleConfig,
  [HelloWorldModule]
>;
const MeasurementConfig = createConfig<MeasurementModule>(({ z }) => ({
  measurement: z.string().default("cm"),
}));
const MeasurementContext = createContext<MeasurementModule>(({ z, fn }) => ({
  foot: z.string().default("cm"),
  valueA: z.number().default(0),
  valueB: z.number().default(0),
  measurement: fn<undefined, string>({
    value: undefined,
    output: z.string(),
    implement: (context, _config) => {
      const helloWorld = "Hello, World!";
      if (typeof context.sayHello !== "function") {
        throw new Error("invalid type");
      }
      return `${helloWorld} A is ${context.valueA} ${context.foot} and B is ${context.valueB} ${context.foot}`;
    },
  }),
}));
const Measurement = createModule<MeasurementModule>({
  name: "Measurement" as const,
  required: [createModuleName("HelloWorld" as const)],
  config: MeasurementConfig,
  context: MeasurementContext,
});

interface TestModuleContext {
  testFn: (value: number) => number;
  testFn2: (value: number) => string[];
}

interface TestModuleConfig {
  is_test: true;
}
type TestModule = createModuleDef<
  "Test",
  TestModuleContext,
  TestModuleConfig,
  [HelloWorldModule, PipesCoreModule],
  [MeasurementModule]
>;
const TestConfig = createConfig<TestModule>(({ z }) => ({
  is_test: z.literal(true).default(true),
}));

/* <Context extends Partial<MeasurementModuleContext>>(
  context: unknown,
): context is Simplify<
  Required<Pick<Context, keyof MeasurementModuleContext>> & Omit<Context, keyof MeasurementModuleContext>
> => {
  return !!(context && typeof context === "object" && ("valueA" as keyof MeasurementModuleContext) in context);
}; */

const TestContext = createContext<TestModule>(({ z, fn }) => ({
  testFn2: fn<number, string[]>({
    value: z.number().min(1),
    output: z.array(z.string()).min(1),
    implement: (context, _config, value) => {
      if (value === 1) {
        return context.stack;
      }
      return context.testFn2(value - 1);
    },
  }),
  testFn: fn<number, number>({
    value: z.number(),
    output: z.number(),
    implement: (context, _config, value) => {
      if (ContextHasModule<MeasurementModuleContext, "valueA", typeof context>(context, "valueA")) {
        return value + context.valueA + 100;
      }
      return value;
    },
  }),
}));
const Test = createModule<TestModule>({
  name: "Test" as const,
  required: ["HelloWorld"],
  optional: ["Measurement"],
  config: TestConfig,
  context: TestContext,
});

interface TestDeepModuleContext {
  stack: string[];
  a: () => void;
  b: () => void;
  c: () => void;
  d: () => void;
  one: () => void;
  two: () => void;
  three: () => void;
  four: () => void;
  five: () => void;
  six: () => void;
  seven: () => void;
  eight: () => void;
  nine: () => void;
  ten: () => void;
}

interface TestDeepModuleConfig {
  appName: string;
}
type TestDeepModule = createModuleDef<"TestDeep", TestDeepModuleContext, TestDeepModuleConfig>;
const TestDeepConfig = createConfig<TestDeepModule>(({ z }) => ({
  appName: z.string().default("TestConfig"),
}));
const TestDeepContext = createContext<TestDeepModule>(({ fn, z }) => ({
  stack: z.array(z.string()).default([]),
  a: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(context.stack, ["TestConfig", "a"], "Stack of function a");
      context.b();
    },
  }),
  b: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(context.stack, ["TestConfig", "a", "b"], "Stack of function b");
      context.c();
    },
  }),
  c: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(context.stack, ["TestConfig", "a", "b", "c"], "Stack of function c");
      context.d();
    },
  }),
  d: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(context.stack, ["TestConfig", "a", "b", "c", "d"], "Stack of function d");
      // End of chain, no further calls
    },
  }),
  one: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(context.stack, ["TestConfig", "one"], "Stack of function one");
      context.two();
    },
  }),
  two: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(context.stack, ["TestConfig", "one", "two"], "Stack of function two");
      context.three();
    },
  }),
  three: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(context.stack, ["TestConfig", "one", "two", "three"], "Stack of function three");
      context.four();
    },
  }),
  four: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(context.stack, ["TestConfig", "one", "two", "three", "four"], "Stack of function four");
      context.five();
    },
  }),
  five: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(
        context.stack,
        ["TestConfig", "one", "two", "three", "four", "five"],
        "Stack of function five",
      );
      context.six();
    },
  }),
  six: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(
        context.stack,
        ["TestConfig", "one", "two", "three", "four", "five", "six"],
        "Stack of function six",
      );
      context.seven();
    },
  }),
  seven: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(
        context.stack,
        ["TestConfig", "one", "two", "three", "four", "five", "six", "seven"],
        "Stack of function seven",
      );
      context.eight();
    },
  }),
  eight: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(
        context.stack,
        ["TestConfig", "one", "two", "three", "four", "five", "six", "seven", "eight"],
        "Stack of function eight",
      );
      context.nine();
    },
  }),
  nine: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(
        context.stack,
        ["TestConfig", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"],
        "Stack of function nine",
      );
      context.ten();
    },
  }),
  ten: fn<undefined, undefined>({
    implement: (context) => {
      assert.deepStrictEqual(
        context.stack,
        ["TestConfig", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
        "Stack of function ten",
      );
      // End of chain, no further calls
    },
  }),
}));

const TestDeep = createModule<TestDeepModule>({
  name: "TestDeep" as const,
  config: TestDeepConfig,
  context: TestDeepContext,
});

describe("base class", () => {
  it("create class", () => {
    const class1 = createPipesCore();
    expect(class1).toBeDefined();
  });
  describe("config", () => {
    it("can get config", () => {
      const class1 = createPipesCore();
      const context = class1.config.appName;
      expect(context).toBeDefined();
      expect(context).toBe("pipes");
    });
    it("can set config", () => {
      const class1 = createPipesCore();
      class1.config.appName = "test";
      const context = class1.config.appName;
      expect(context).toBeDefined();
      expect(context).toBe("test");
    });
    it("throws on incorect data", () => {
      const class1 = createPipesCore();
      expect(() => {
        /** @ts-expect-error - This should be incorrect type */
        class1.config.appName = 1;
      }).toThrow();
    });
    describe("merge module", () => {
      it("get correct type from one module", () => {
        type test = MergeModules<[PipesCoreModule]>;
        type ConfigInterface = test["Config"]["Merged"];
        type Env = ConfigInterface["env"];
        const github: Env = "github";
        const gitlab: Env = "gitlab";
        const local: Env = "local";
        /** @ts-expect-error - this should not be possible */
        const _fails: Env = "fail";
        expect(github).toBe("github");
        expect(gitlab).toBe("gitlab");
        expect(local).toBe("local");

        type ContextInterface = test["Context"]["OutsideInterface"];
        type Value = ContextInterface["modules"];
        const arg: Value = [];
        expect(arg.length).toBe(0);
      });
    });
    describe("context", () => {
      it("can get context", () => {
        const class1 = createPipesCore();
        const fn = class1.context.hasModule;
        const context = class1.context;
        const config = class1.config;
        assert.equal(typeof fn, "function", "Return type should be function");
        expect(fn).toThrow();
        expect(() => {
          /** @ts-expect-error */
          return fn({}, {}, "hehe");
        }).toThrow();
        const value = fn(context as any, config, "Pipes");
        expect(value).toBe(false);
        const value2 = fn(context as any, config, "PipesCore");
        expect(value2).toBe(true);
        const modules = class1.context.modules;
        expect(modules[0]).toBe("PipesCore");
      });
      it("can set context", () => {
        const class1 = createPipesCore();
        const context = class1.context;
        const config = class1.config;
        class1.context.hasModule = (_context: any, _config: any, _arg: any) => {
          return "WTF" as unknown as boolean;
        };
        const fn = class1.context.hasModule;
        expect(() => fn(context as any, config, "Pipes")).toThrow();
        class1.context.hasModule = (_context: any, _config: any, _arg: any) => {
          return true;
        };
        expect(class1.context.hasModule({} as any, {} as any, "hehe")).toBe(true);
      });
      it("cannot set modules or client", () => {
        const class1 = createPipesCore();
        expect(() => (class1.context.client = "hehe" as any)).toThrow();
        expect(() => (class1.context.modules = ["hehe", "ok", "wow"])).toThrow();
      });
      it("setting client, makes client ready", () => {
        const class1 = createPipesCore();
        class1.client = new Client();
        expect(class1.isReady).toBe(true);
      });
    });
    describe("context binding", () => {
      it("can get all keys", () => {
        const class1 = createPipesCore();
        const shouldHave = [
          "startTime",
          "getDurationInMs",
          "addContextToCore",
          "imageStore",
          "haltAll",
          "addEnv",
          "client",
          "modules",
          "stack",
          "hasModule",
        ];
        const keys = Object.keys(class1.context);
        // Don't want to hardcode the order
        assert.equal(keys.length, shouldHave.length, "Length should be equal");
        keys.forEach((e) => {
          assert.equal(shouldHave.includes(e), true, `Context should have key ${e}`);
        });
      });
      it("call context", async () => {
        const class1 = createPipesCore().addModule<HelloWorldModule>(HelloWorld).addModule<TestModule>(Test);
        class1.client = new Client();
        class1.addScript((context) => {
          const value = context.testFn(10);
          expect(value).toBe(10);
        });
        await class1.run(runningState);
      });
      it("call stack", async () => {
        const class1 = createPipesCore().addModule<HelloWorldModule>(HelloWorld).addModule<TestModule>(Test);
        class1.client = new Client();
        class1.addScript((context) => {
          const value = context.testFn2(10);
          expect(value.length).toBe(11);
          expect(value).toStrictEqual([
            "pipes", // appname
            "testFn2",
            "testFn2",
            "testFn2",
            "testFn2",
            "testFn2",
            "testFn2",
            "testFn2",
            "testFn2",
            "testFn2",
            "testFn2",
          ]);
        });
        await class1.run(runningState);
      });
      it("extreme call stack", async () => {
        const class1 = createPipesCore().addModule<TestDeepModule>(TestDeep);
        class1.client = new Client();
        class1.addScript((context) => {
          context.one();
        });
        class1.addScript((context) => {
          context.a();
        });
        await class1.run(runningState);
      });
      it("extreme call stack 2", async () => {
        const class1 = createPipesCore().addModule<TestDeepModule>(TestDeep);
        class1.client = new Client();
        class1.addScript((context) => {
          assert.throws(() => context.b());
        });
        await class1.run(runningState);
      });
      it("test optional module", async () => {
        const class1 = createPipesCore().addModule<HelloWorldModule>(HelloWorld).addModule<TestModule>(Test);
        class1.client = new Client();
        class1.addScript((context) => {
          const value = context.testFn(1);
          expect(value).toBe(1);
        });
        await class1.run(runningState);
        const class2 = createPipesCore()
          .addModule<HelloWorldModule>(HelloWorld)
          .addModule<MeasurementModule>(Measurement)
          .addModule<TestModule>(Test);
        class2.client = new Client();
        class2.context.hello;
        class2.context.valueA = 100;
        class2.addScript((context) => {
          const value = context.testFn(100);
          expect(value).toBe(300);
        });
        await class2.run(runningState);
      });
    });
  });
  describe("module", () => {
    it("add one", () => {
      const class1 = createPipesCore().addModule<HelloWorldModule>(HelloWorld);
      const context = class1.context;
      const config = class1.config;
      const appName = class1.config.appName;
      expect(appName).toBe("pipes");
      const helloWorld = class1.context.sayHello(context as any, config);
      expect(helloWorld).toBe("Hello world!");
      class1.config.shouldSayBye = true;
      const byeWorld = class1.context.sayHello(context as any, config);
      expect(byeWorld).toBe("Bye world!");
    });
    it("error if required module is missing", () => {
      expect(() => createPipesCore().addModule<MeasurementModule>(Measurement)).toThrow();
    });
    it("add two", () => {
      const class1 = createPipesCore()
        .addModule<HelloWorldModule>(HelloWorld)
        .addModule<MeasurementModule>(Measurement);
      const context = class1.context;
      const config = class1.config;
      class1.context.sayHello(context as any, config);
      const ble = class1.context.measurement(context as any, config as any);
      expect(ble).toBe(`Hello, World! A is 0 cm and B is 0 cm`);
    });
  });
  describe("test dependency", () => {
    it("can add dependency", () => {
      createPipesCore().addModule<HelloWorldModule>(HelloWorld).addDependency(Symbol());
    });
    it("waits for dependency", async () => {
      const deps = Symbol();
      const state = createState();
      const context = createPipesCore()
        .addModule<HelloWorldModule>(HelloWorld)
        .addDependency(deps)
        .addScript(() => {
          // Empty on purpose
        });
      context.client = new Client();
      const internalState = createInternalState();
      void context.run(state, internalState);
      state.symbolsOfTasks = [deps];
      state.state = "running";
      await when(() => {
        return internalState.state === "waiting_for_dependency";
      });

      state.symbolsOfTasksCompleted = [deps];
      await when(() => {
        return internalState.state === "finished";
      });
    });
    it("throws when dependency does not exist", async () => {
      const deps = Symbol();
      const state = createState();
      const context = createPipesCore()
        .addModule<HelloWorldModule>(HelloWorld)
        .addDependency(deps)
        .addScript(() => {
          // Empty on purpose
        });
      context.client = new Client();
      state.state = "running";
      const internalState = createInternalState();
      await assert.rejects(context.run(state, internalState));
      assert(internalState.state === "failed");
    });
    it("throws when dependency has failed", async () => {
      const deps = Symbol();
      const state = createState();
      const context = createPipesCore()
        .addModule<HelloWorldModule>(HelloWorld)
        .addDependency(deps)
        .addScript(() => {
          // Empty on purpose
        });
      context.client = new Client();
      state.symbolsOfTasks = [deps];
      state.symbolsOfTasksFailed = [deps];
      state.state = "running";
      const internalState = createInternalState();
      await assert.rejects(context.run(state, internalState));
      assert(internalState.state === "failed");
    });
  });
});
