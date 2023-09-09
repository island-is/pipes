import assert from "node:assert";
import { describe, it } from "node:test";

import { autorun } from "mobx";
import { z } from "zod";

import {
  createGlobalSymbolStore,
  createLockStore,
  createZodKeyStore,
  createZodStore,
  wrapContext,
} from "./observer.js";

describe("createZodStore Tests", () => {
  it("should correctly initialize store with default values", () => {
    const schema = {
      name: z.string().optional(),
      age: z.number().optional(),
    };
    const store = createZodStore(schema);

    assert.strictEqual(store.name, undefined);
    assert.strictEqual(store.age, undefined);
  });

  it("should use default correctly", () => {
    const schema = {
      name: z.string().optional().default("ok"),
      age: z.number().optional().default(2),
    };
    const store = createZodStore(schema);

    assert.strictEqual(store.name, "ok");
    assert.strictEqual(store.age, 2);
  });

  it("should set and get values correctly", () => {
    const schema = {
      name: z.string(),
      age: z.number(),
    };
    const store = createZodStore(schema);

    store.name = "John";
    store.age = 25;

    assert.strictEqual(store.name, "John");
    assert.strictEqual(store.age, 25);
  });

  it("should throw when setting invalid values", () => {
    const schema = {
      name: z.string(),
      age: z.number(),
    };
    const store = createZodStore(schema);

    assert.throws(() => {
      (store as any).name = 123;
    });

    assert.throws(() => {
      (store as any).age = "twenty-five";
    });
  });
  it("should be observable", () => {
    const schema = {
      name: z.string(),
      age: z.number(),
    };
    const store = createZodStore(schema);
    let value = "";
    store.name = "John Doe";
    store.age = 24;
    const stop = autorun(() => (value = `${store.name} is ${store.age} years old`));
    assert.strictEqual(value, `${store.name} is ${store.age} years old`);
    store.age = 25;
    assert.strictEqual(value, `${store.name} is 25 years old`);
    store.name = "Marilyn Monroe";
    assert.strictEqual(value, `Marilyn Monroe is 25 years old`);
    stop();
  });
  it("should correctly skip specified keys", () => {
    const schema = {
      name: z.string(),
      age: z.number(),
    };
    const skip = [{ key: "name" as const, get: () => "Skipped" }];
    const store = createZodStore(schema, skip);

    assert.strictEqual(store.name, "Skipped");
  });
});
describe("LockStore Tests", () => {
  it("should lock and unlock correctly", async () => {
    const lockStore = createLockStore();

    let locked = false;
    await lockStore.lock("testKey", () => {
      locked = lockStore.isLocked("testKey");
    });

    assert.strictEqual(locked, true);
    assert.strictEqual(lockStore.isLocked("testKey"), false);
  });
});

describe("ZodKeyStore Tests", () => {
  it("should get, set and conditionally get/set correctly", async () => {
    const zodSchema = z.object({
      name: z.string(),
    });
    const keyStore = createZodKeyStore(zodSchema);

    let result = await keyStore.getKey("user");
    assert.strictEqual(result, null);

    await keyStore.setKey("user", { name: "John" });
    result = await keyStore.getKey("user");
    assert.deepStrictEqual(result, { name: "John" });

    result = await keyStore.getOrSet("user", () => ({ name: "Doe" }));
    assert.deepStrictEqual(result, { name: "John" });

    result = await keyStore.getOrSet("user2", () => ({ name: "Doe" }));
    assert.deepStrictEqual(result, { name: "Doe" });
    result = await keyStore.getKey("user2");
    assert.deepStrictEqual(result, { name: "Doe" });
  });
  it("should use default correctly", async () => {
    const zodSchema = z.string().default("what");
    const keyStore = createZodKeyStore(zodSchema);
    const value = await keyStore.getKey("undefined");
    assert(value === "what");
  });
});

describe("ZodKeyStore awaitForAvailability Tests", () => {
  it("should wait until a key is available and then resolve", async () => {
    const zodSchema = z.object({
      name: z.string(),
    });
    const keyStore = createZodKeyStore(zodSchema);

    let flag = false;
    const promise = keyStore.awaitForAvailability("user3").then((value) => {
      flag = true;
      assert.deepStrictEqual(value, { name: "John" });
    });

    assert.strictEqual(flag, false);

    setTimeout(() => {
      keyStore.setKey("user3", { name: "John" });
    }, 100);

    await promise;

    assert.strictEqual(flag, true);
  });

  it("should resolve immediately if the key is already available", async () => {
    const zodSchema = z.object({
      name: z.string(),
    });
    const keyStore = createZodKeyStore(zodSchema);

    await keyStore.setKey("user4", { name: "Doe" });

    const result = await keyStore.awaitForAvailability("user4");
    assert.deepStrictEqual(result, { name: "Doe" });
  });
});

describe("wrapContext Tests", () => {
  it("should correctly wrap functions with new context", () => {
    const schema = {
      add: (context: any, config: any, { x, y }: { x: number; y: number }) => {
        // Example to use the context and config
        assert.deepStrictEqual(config, { appName: "TestConfig" });
        assert.deepStrictEqual(context.stack, ["TestConfig", "add"]);
        return x + y;
      },
    };
    const config = { appName: "TestConfig" };
    const wrappedStore = wrapContext(schema, config);
    const result = wrappedStore.add({ x: 2, y: 3 });
    // Check if the function works correctly
    assert.strictEqual(result, 5);
  });
  it("multiple runs", () => {
    const schema = {
      a: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, ["TestConfig", "a"]);
        context.b();
      },
      b: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, ["TestConfig", "a", "b"]);
        context.c();
      },
      c: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, ["TestConfig", "a", "b", "c"]);
        context.d();
      },
      d: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, ["TestConfig", "a", "b", "c", "d"]);
        // End of chain, no further calls
      },
      one: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, ["TestConfig", "one"]);
        context.two();
      },
      two: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, ["TestConfig", "one", "two"]);
        context.three();
      },
      three: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, ["TestConfig", "one", "two", "three"]);
        context.four();
      },
      four: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, ["TestConfig", "one", "two", "three", "four"]);
        context.five();
      },
      five: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, ["TestConfig", "one", "two", "three", "four", "five"]);
        context.six();
      },
      six: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, ["TestConfig", "one", "two", "three", "four", "five", "six"]);
        context.seven();
      },
      seven: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, ["TestConfig", "one", "two", "three", "four", "five", "six", "seven"]);
        context.eight();
      },
      eight: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, [
          "TestConfig",
          "one",
          "two",
          "three",
          "four",
          "five",
          "six",
          "seven",
          "eight",
        ]);
        context.nine();
      },
      nine: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, [
          "TestConfig",
          "one",
          "two",
          "three",
          "four",
          "five",
          "six",
          "seven",
          "eight",
          "nine",
        ]);
        context.ten();
      },
      ten: (context: any, _config: any) => {
        assert.deepStrictEqual(context.stack, [
          "TestConfig",
          "one",
          "two",
          "three",
          "four",
          "five",
          "six",
          "seven",
          "eight",
          "nine",
          "ten",
        ]);
        // End of chain, no further calls
      },
    };
    const config = { appName: "TestConfig" };
    const wrappedStore = wrapContext(schema, config);
    wrappedStore.one();
    wrappedStore.a();
    assert.throws(() => wrappedStore.two());
    assert.throws(() => wrappedStore.b());
  });
});

describe("ZodSymbol", () => {
  it("get one", async () => {
    const symbol = Symbol();
    const ble = await createGlobalSymbolStore(z.string().default("hehe"), "amazing");
    let value = await ble.getKey(symbol);
    /** @ts-expect-error - should not be possible */
    const _x: typeof value = 1;
    const _y: typeof value = "hehe";
    assert(value === "hehe", "default not on");
    ble.setKey(symbol, "nono");
    value = await ble.getKey(symbol);
    assert(value === "nono", "did not change");
  });
});
