import assert from "node:assert";
import test from "node:test";

import { z } from "@island.is/zod";

import { createPipesContextCommand } from "./create-pipes-context-command.js";

import type { CreateModule, newModuleName } from "./types/module.js";
import type { ZodString } from "@island.is/zod";

interface TestConfig {
  bravo: boolean;
}
type TestModule = CreateModule<
  newModuleName<"test">,
  {
    name: string;
  },
  TestConfig
>;

test("can create command", () => {
  const command = createPipesContextCommand<TestModule, null, void>({
    value: z.null(),
    output: z.void(),
    implement: () => null,
  });
  type CommandParameters = Parameters<typeof command>;
  type ShouldNotHappen = ZodString extends CommandParameters[0]["name"] ? true : false;
  /* @ts-expect-error This should be false */
  const _BLE: ShouldNotHappen = true;
  type ContextParameter = string extends CommandParameters[0]["name"] ? true : false;
  type ConfigParameter = boolean extends CommandParameters[1]["bravo"] ? true : false;
  type thisIsPossible = ConfigParameter & ContextParameter;
  const _TEST: thisIsPossible = true;
  assert.strictEqual(_TEST, true);
});
test("able to run command", (_t, done) => {
  const fn = (context: any, config: any, value: any) => {
    assert.deepStrictEqual(context, { name: "test", callStack: [], client: null as any });
    assert.deepStrictEqual(config, { bravo: false });
    assert.strictEqual(value, null);
    done();
  };
  const command = createPipesContextCommand<TestModule, null, void>({
    value: z.null(),
    output: z.void(),
    implement: fn,
  });

  command({ name: "test", callStack: [], client: null as any }, { bravo: false }, null);
});
test("able to run command and get value", () => {
  const fn = () => 123;
  const command = createPipesContextCommand<TestModule, null, number>({
    value: z.null(),
    output: z.number(),
    implement: fn,
  });
  assert.deepEqual(command({ name: "test", callStack: [], client: null as any }, { bravo: false }, null), 123);
});
test("should allow extra parameters in context and config", (_t, done) => {
  const fn = () => {
    done();
  };
  const command = createPipesContextCommand<TestModule, null, void>({
    value: z.null(),
    output: z.void(),
    implement: fn,
  });
  command(
    { name: "test", name2: "what is this", callStack: [], client: null as any },
    { bravo: false, extraConfig: false },
    null,
  );
});
test("should not allow extra parameters in strict mode", () => {
  const fn = () => {
    // empty on purpose - will fail before
  };
  const command = createPipesContextCommand<TestModule, { name: string; value: string }, void>({
    value: z.object({ name: z.string(), value: z.string() }).strict(),
    output: z.void(),
    implement: fn,
  });
  const call = () => {
    command(
      { name: "test", name2: "what is this", callStack: [], client: null as any },
      { bravo: false, extraConfig: false },
      {
        name: "test",
        value: "test",
        // @ts-expect-error - This should not be allowed.
        extraValue: "what is this",
      },
    );
  };
  assert.throws(call);
});
