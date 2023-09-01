import { describe, it } from "node:test";

import { expect } from "./expect.js";

import type {
  CreateModule,
  MergeOutsideInterface,
  MergeStateHelper,
  Module,
  ModuleConfig,
  ModuleContext,
  newModuleName,
} from "./module.js";

describe("module types", () => {
  describe("ModuleConfig", () => {
    it("if no merge is provided it should be the same as the incoming config", () => {
      // If no merged is provided, it should be the same as the incoming config
      type _config = ModuleConfig<{ a: string }>;
      type ble = _config["Merged"]["a"] extends _config["Incoming"]["a"] ? true : false;
      expect(true as ble).toBe(true);
    });
    it("if a merge is provided it should include all keys in incoming config", () => {
      // @ts-expect-error Merged does not include config
      type _config = ModuleConfig<{ a: string }, { b: number }>;
      // @ts-expect-error Merged does not include config
      type __config = ModuleConfig<{ a: string; b: number }, { b: number }>;
      expect(true).toBe(true);
    });
  });
  describe("ModuleContext", () => {
    it("OutsideInterface should have same keys as ContextInterface", () => {
      // @ts-expect-error OutsideInterface does not have same keys as ContextInterface
      type _config = ModuleContext<{ a: string }, { b: string }, { a: string }>;
      // @ts-expect-error OutsideInterface does not have same keys as ContextInterface
      type __config = ModuleContext<{ a: string; b: string }, { b: string; c: string }, { a: string }>;
      expect(true).toBe(true);
    });
    it("OutsideInterface can have different values than ContextInterface", () => {
      type _config = ModuleContext<{ a: string }, { a: number }, { a: string }>;
      expect(true).toBe(true);
    });
    it("Implement should have same keys as ContextInterface", () => {
      // @ts-expect-error Implement does not have same keys as ContextInterface
      type _config = ModuleContext<{ a: string }, { a: string }, { c: string }>;
      // @ts-expect-error Implement does not have same keys as ContextInterface
      type __config = ModuleContext<{ a: string; b: string }, { a: string; b: string }, { a: string; c: string }>;
      type ___config = ModuleContext<
        { a: string; b: string },
        { a: string; b: string },
        { a: string; b: string; c: string }
      >;
      expect(true).toBe(true);
    });
  });
  describe("MergeState", () => {
    it("One with no required or optional", () => {
      interface WhatIsLove {
        baby: true;
        dontHurtMe: "ohno";
      }
      type OK = MergeOutsideInterface<WhatIsLove, [], []>;
      const _test: OK = {
        baby: true,
        dontHurtMe: "ohno",
      };
      expect(_test.baby).toBe(true);
    });
    it("One with required", () => {
      interface WhatIsLove {
        baby: true;
        dontHurtMe: "ohno";
      }
      type Module1 = Module<
        newModuleName<"hehe">,
        { wohoho: true },
        ModuleConfig<Record<string, never>>,
        ModuleContext<{ wohoho: true }>
      >;

      type _OK = MergeStateHelper<"Definition", WhatIsLove, [Module1]>;
      type OK = MergeOutsideInterface<WhatIsLove, [Module1]>;
      type compare = _OK extends OK ? true : false;
      const _TESTTEST: compare = true;
      const _test: OK = {
        baby: true,
        dontHurtMe: "ohno",
        wohoho: true,
      };
      expect(_test.baby).toBe(true);
      expect(_TESTTEST).toBe(true);
    });
    it("One with optional", () => {
      interface WhatIsLove {
        baby: true;
        dontHurtMe: "ohno";
      }
      type Module1 = Module<
        newModuleName<"hehe">,
        { wohoho: true },
        ModuleConfig<Record<string, never>>,
        ModuleContext<{ wohoho: true }>
      >;

      type _OK = MergeStateHelper<"Definition", WhatIsLove, [], [Module1]>;
      type OK = MergeOutsideInterface<WhatIsLove, [], [Module1]>;
      type compare = _OK extends OK ? true : false;
      const _TESTTEST: compare = true;
      const _test: OK = {
        baby: true,
        dontHurtMe: "ohno",
      };
      _test.wohoho = true;
      expect(_test.baby).toBe(true);
    });
    it("One with optional and required", () => {
      interface WhatIsLove {
        baby: true;
        dontHurtMe: "ohno";
      }
      type Module1 = Module<
        newModuleName<"hehe">,
        { wohoho: true },
        ModuleConfig<Record<string, never>>,
        ModuleContext<{ wohoho: true }>
      >;
      type Module2 = Module<
        newModuleName<"module2">,
        { newHit: "no an oldie" },
        ModuleConfig<Record<string, never>>,
        ModuleContext<{ wohoho: true }>
      >;

      type _OK = MergeStateHelper<"Definition", WhatIsLove, [Module1], [Module2]>;
      type OK = MergeOutsideInterface<WhatIsLove, [Module1], [Module2]>;
      type compare = _OK extends OK ? true : false;
      const _TESTTEST: compare = true;
      const _test: OK = {
        baby: true,
        dontHurtMe: "ohno",
        wohoho: true,
      };
      _test.wohoho = true;
      _test.newHit = "no an oldie";
      expect(_test.baby).toBe(true);
    });
  });
  describe("Create module", () => {
    it("Create module with no required or optional modules", () => {
      type moduleName = newModuleName<"test-module">;
      interface Definition {
        hello: "world" | "user";
        getName: (value: number) => string;
      }
      type testModule = CreateModule<
        moduleName,
        // Definition
        Definition,
        // Config
        {
          version: number;
        }
      >;
      type _name = testModule["ModuleName"] extends moduleName ? true : false;
      type __name = testModule["ModuleName"] extends "test-module" ? true : false;
      const _NAME_TEST: _name & __name = true;
      type _config = testModule["Config"]["Merged"] extends { version: number } ? true : false;
      type __config = testModule["Config"]["Incoming"] extends { version: number } ? true : false;
      const _CONFIG_TEST: _config & __config = true;
      type _definition = testModule["Definition"] extends Definition ? true : false;
      const _DEFINITION_TEST: _definition = true;
      type _contextInterface = testModule["Context"]["ContextInterface"];
      type _outsideInterface = testModule["Context"]["OutsideInterface"];
      type _implementation = testModule["Context"]["Implement"];
      type _context = _contextInterface extends Definition ? true : false;
      const Obj: _outsideInterface = {} as any;
      /** @ts-expect-error - We cannot use normal function here. */
      Obj.getName = (context, config, value) => {
        type context = typeof context;
        type config = typeof config;
        type configTest = typeof config extends { version: number } ? true : false;
        type value = typeof value;
        type valueTest = typeof value extends number ? true : false;
        type world = context["hello"] extends "world" | "user" ? true : false;
        const _BLE: world & valueTest & configTest = true;
        return "wow this works";
      };
      expect(true).toBe(true);
    });
    it("create module with required module", () => {
      type moduleName = newModuleName<"test-module">;
      type moduleName2 = newModuleName<"test-module2">;
      interface Definition {
        hello: "world" | "user";
        getName: (value: number) => string;
      }
      interface Definition2 {
        rocks: boolean;
      }
      type testModule1 = CreateModule<
        moduleName,
        // Definition
        Definition,
        // Config
        {
          version: number;
        }
      >;
      type testModule = CreateModule<
        moduleName2,
        Definition2,
        {
          name: string;
        },
        [testModule1]
      >;
      type _name = testModule["ModuleName"] extends moduleName2 ? true : false;
      type __name = testModule["ModuleName"] extends "test-module2" ? true : false;
      const _NAME_TEST: _name & __name = true;
      type _config = testModule["Config"]["Merged"] extends { version: number; name: string } ? true : false;
      type __config = testModule["Config"]["Incoming"] extends { name: string } ? true : false;
      const _CONFIG_TEST: _config & __config = true;
      type _definition = testModule["Definition"] extends Definition2 ? true : false;
      const _DEFINITION_TEST: _definition = true;
      type _contextInterface = testModule["Context"]["ContextInterface"];
      type _outsideInterface = testModule["Context"]["OutsideInterface"];
      type _implementation = testModule["Context"]["Implement"];
      type _context = _contextInterface extends Definition ? true : false;
      const Obj: _outsideInterface = {} as any;
      /** @ts-expect-error - We cannot use normal function here. */
      Obj.getName = (context, config, value) => {
        type context = typeof context;
        type config = typeof config;
        type configTest = typeof config extends { version: number; name: string } ? true : false;
        type value = typeof value;
        type valueTest = typeof value extends number ? true : false;
        type world = context["hello"] extends "world" | "user" ? true : false;
        const _BLE: world & valueTest & configTest = true;
        return "wow this works";
      };
      expect(true).toBe(true);
    });
    it("create module with optional module", () => {
      type moduleName = newModuleName<"test-module">;
      type moduleName2 = newModuleName<"test-module2">;
      interface Definition {
        hello: "world" | "user";
        getName: (value: number) => string;
      }
      interface Definition2 {
        rocks: boolean;
        getRocks: () => void;
      }
      type testModule1 = CreateModule<
        moduleName,
        // Definition
        Definition,
        // Config
        {
          version: number;
        }
      >;
      type testModule = CreateModule<
        moduleName2,
        Definition2,
        {
          name: string;
        },
        [],
        [testModule1]
      >;
      type _name = testModule["ModuleName"] extends moduleName2 ? true : false;
      type __name = testModule["ModuleName"] extends "test-module2" ? true : false;
      const _NAME_TEST: _name & __name = true;
      type _config = testModule["Config"]["Merged"] extends { version?: number; name: string } ? true : false;
      type __config = testModule["Config"]["Incoming"] extends { name: string } ? true : false;
      const _CONFIG_TEST: _config & __config = true;
      type _definition = testModule["Definition"] extends Definition2 ? true : false;
      const _DEFINITION_TEST: _definition = true;
      type _contextInterface = testModule["Context"]["ContextInterface"];
      type _outsideInterface = testModule["Context"]["OutsideInterface"];
      type _implementation = testModule["Context"]["Implement"];
      type _context = _contextInterface extends Definition ? true : false;
      const Obj: _outsideInterface = {} as any;
      /** @ts-expect-error - Cannot assign function like this */
      Obj.getRocks = (context, config) => {
        type context = typeof context;
        type config = typeof config;
        type configTest = typeof config extends { version?: number; name: string } ? true : false;
        type world = context["hello"] extends "world" | "user" | undefined ? true : false;
        const _BLE: world & configTest = true;
      };
      expect(true).toBe(true);
    });
    it("create module with required modules", () => {
      type moduleName = newModuleName<"test-module">;
      type moduleName2 = newModuleName<"test-module2">;
      type moduleName3 = newModuleName<"test-module3">;
      type moduleName4 = newModuleName<"test-module4">;
      type moduleName5 = newModuleName<"test-module5">;
      interface Definition {
        hello: "world" | "user";
        getName: (value: number) => string;
      }
      interface Definition2 {
        rocks: boolean;
        getRocks: () => void;
      }
      interface Definition3 {
        value3: boolean;
      }
      interface Definition4 {
        value4: boolean;
      }
      interface Definition5 {
        value5: boolean;
      }
      type testModule3 = CreateModule<
        moduleName3,
        // Definition
        Definition3,
        // Config
        {
          version3: number;
        }
      >;
      type testModule4 = CreateModule<
        moduleName4,
        // Definition
        Definition4,
        // Config
        {
          version4: number;
        }
      >;
      type testModule5 = CreateModule<
        moduleName5,
        // Definition
        Definition5,
        // Config
        {
          version5: number;
        }
      >;
      type testModule1 = CreateModule<
        moduleName,
        // Definition
        Definition,
        // Config
        {
          version: number;
        }
      >;
      type testModule = CreateModule<
        moduleName2,
        Definition2,
        {
          name: string;
        },
        [testModule1, testModule3, testModule4, testModule5],
        []
      >;
      type _name = testModule["ModuleName"] extends moduleName2 ? true : false;
      type __name = testModule["ModuleName"] extends "test-module2" ? true : false;
      const _NAME_TEST: _name & __name = true;
      type _config = testModule["Config"]["Merged"] extends {
        version: number;
        name: string;
        version3: number;
        version4: number;
        version5: number;
      }
        ? true
        : false;
      type __config = testModule["Config"]["Incoming"] extends { name: string } ? true : false;
      const _CONFIG_TEST: _config & __config = true;
      type _definition = testModule["Definition"] extends Definition2 ? true : false;
      const _DEFINITION_TEST: _definition = true;
      type _contextInterface = testModule["Context"]["ContextInterface"];
      type _outsideInterface = testModule["Context"]["OutsideInterface"];
      type _implementation = testModule["Context"]["Implement"];
      type _context = _contextInterface extends Definition ? true : false;
      const Obj: _outsideInterface = {} as any;
      /** @ts-expect-error - Cannot assign function like this */
      Obj.getRocks = (context, config) => {
        type context = typeof context;
        type config = typeof config;
        type configTest = typeof config extends {
          version: number;
          name: string;
          version3: number;
          version4: number;
          version5: number;
        }
          ? true
          : false;
        type world = context["hello"] extends "world" | "user" | undefined ? true : false;
        type value5 = [context["value5"], context["value4"], context["value3"]] extends [boolean, boolean, boolean]
          ? true
          : false;
        const _BLE: world & configTest & value5 = true;
      };
      expect(true).toBe(true);
    });
    it("create module with optional modules", () => {
      type moduleName = newModuleName<"test-module">;
      type moduleName2 = newModuleName<"test-module2">;
      type moduleName3 = newModuleName<"test-module3">;
      type moduleName4 = newModuleName<"test-module4">;
      type moduleName5 = newModuleName<"test-module5">;
      interface Definition {
        hello: "world" | "user";
        getName: (value: number) => string;
      }
      interface Definition2 {
        rocks: boolean;
        getRocks: () => void;
      }
      interface Definition3 {
        value3: boolean;
      }
      interface Definition4 {
        value4: boolean;
      }
      interface Definition5 {
        value5: boolean;
      }
      type testModule3 = CreateModule<
        moduleName3,
        // Definition
        Definition3,
        // Config
        {
          version3: number;
        }
      >;
      type testModule4 = CreateModule<
        moduleName4,
        // Definition
        Definition4,
        // Config
        {
          version4: number;
        }
      >;
      type testModule5 = CreateModule<
        moduleName5,
        // Definition
        Definition5,
        // Config
        {
          version5: number;
        }
      >;
      type testModule1 = CreateModule<
        moduleName,
        // Definition
        Definition,
        // Config
        {
          version: number;
        }
      >;
      type testModule = CreateModule<
        moduleName2,
        Definition2,
        {
          name: string;
        },
        [],
        [testModule1, testModule3, testModule4, testModule5]
      >;
      type _name = testModule["ModuleName"] extends moduleName2 ? true : false;
      type __name = testModule["ModuleName"] extends "test-module2" ? true : false;
      const _NAME_TEST: _name & __name = true;
      type _config = testModule["Config"]["Merged"] extends {
        version?: number;
        name: string;
        version3?: number;
        version4?: number;
        version5?: number;
      }
        ? true
        : false;
      type __config = testModule["Config"]["Incoming"] extends { name: string } ? true : false;
      const _CONFIG_TEST: _config & __config = true;
      type _definition = testModule["Definition"] extends Definition2 ? true : false;
      const _DEFINITION_TEST: _definition = true;
      type _contextInterface = testModule["Context"]["ContextInterface"];
      type _outsideInterface = testModule["Context"]["OutsideInterface"];
      type _implementation = testModule["Context"]["Implement"];
      type _context = _contextInterface extends Definition ? true : false;
      const Obj: _outsideInterface = {} as any;
      /** @ts-expect-error - Cannot assign function like this */
      Obj.getRocks = (context, config) => {
        type context = typeof context;
        type config = typeof config;
        type configTest = typeof config extends {
          version?: number;
          name: string;
          version3?: number;
          version4?: number;
          version5?: number;
        }
          ? true
          : false;
        type world = context["hello"] extends "world" | "user" | undefined ? true : false;
        type value5 = [context["value5"], context["value4"], context["value3"]] extends [
          boolean | undefined,
          boolean | undefined,
          boolean | undefined,
        ]
          ? true
          : false;
        const _BLE: world & configTest & value5 = true;
      };
      expect(true).toBe(true);
    });
  });
});
