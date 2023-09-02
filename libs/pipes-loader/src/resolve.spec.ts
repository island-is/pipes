import assert from "node:assert";
import { describe, it, mock } from "node:test";

import { resolve } from "./resolve.js";

describe("resolve", () => {
  it("should delegate to nextResolve for built-in modules", async () => {
    const nextResolve = mock.fn(() => ({ url: "node:fs", shortCircuit: false })) as any;
    const result = await resolve("fs", {}, nextResolve);
    assert.strictEqual(result.url, "node:fs");
    assert.strictEqual(result.shortCircuit, false);
  });

  it("should return source URL for local scoped packages", async () => {
    const nextResolve = mock.fn(() => ({ url: "node:fs", shortCircuit: false })) as any;
    const result = await resolve("@island.is/pipes-core", {}, nextResolve);
    console.log(result);
    assert.strictEqual(result.url.startsWith("file:///"), true);
    assert.strictEqual(result.url.endsWith("pipes-core.ts"), true);
    assert.strictEqual(result.shortCircuit, true);
  });

  it("should delegate to nextResolve if file does not need to be compiled", async () => {
    const nextResolve = mock.fn(() => ({ url: "some-module", shortCircuit: false })) as any;
    const result = await resolve("some-module", {}, nextResolve);
    assert.strictEqual(result.url, "some-module");
    assert.strictEqual(result.shortCircuit, false);
  });
});
