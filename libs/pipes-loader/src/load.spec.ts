/* eslint-disable require-await */
import assert from "node:assert";
import { promises as fsPromises } from "node:fs";
import { join } from "node:path";
import { describe, it, mock } from "node:test";

import { load } from "./load.js";
const { writeFile, rmdir, mkdir } = fsPromises;

// Create temporary files for testing
async function setupMockFiles(root: string, files: Record<string, string>, type: "module" | "commonjs" = "module") {
  await mkdir(root, { recursive: true });
  writeFile(
    join(root, "package.json"),
    JSON.stringify({
      module: type,
    }),
    "utf-8",
  );
  for (const [filename, content] of Object.entries(files)) {
    await writeFile(join(root, filename), content, "utf-8");
  }
}

async function teardownMockFiles(root: string) {
  await rmdir(root, { recursive: true });
}

describe("load", () => {
  it("should return defaultLoad for built-in modules", async () => {
    const result = await load("fs", {}, async () => ({ shortCircuit: false }));
    assert.strictEqual(result.shortCircuit, false);
  });

  it("should try to load file if unknown extension", async () => {
    const nextFn = mock.fn(() => {});
    assert.rejects(() => load("file:///file.other", {}, nextFn as any));
  });

  it("should load files with non-allowed extensions - module", async () => {
    const root = "/tmp/mockRoot3";
    await setupMockFiles(root, { "file.bad": "bad content" });
    const nextFn = mock.fn(() => {
      throw new Error("Not implemented");
    });
    const data = await load(`file:///${join(root, "file.bad")}`, {}, nextFn);
    assert.strict(typeof data.source, "Buffer");
    assert.strict(data.format, "module");
    assert.strict(data.source?.toString(), "bad content");
    await teardownMockFiles(root);
  });
  it("should load files with non-allowed extensions - commonjs", async () => {
    const root = "/tmp/mockRoot3a";
    await setupMockFiles(root, { "file.bad": "bad content" }, "commonjs");
    const nextFn = mock.fn(() => {
      throw new Error("Not implemented");
    });
    const data = await load(`file:///${join(root, "file.bad")}`, {}, nextFn);
    assert.strict(typeof data.source, "Buffer");
    assert.strict(data.format, "commonjs");
    assert.strict(data.source?.toString(), "bad content");
    await teardownMockFiles(root);
  });
  it("should use default load on node modules", async () => {
    let called = 0;
    const nextFn = mock.fn(() => (called += 1));
    await load(`node:util`, {}, nextFn as any);
    await load(`util`, {}, nextFn as any);
    assert.equal(called, 2);
  });

  it("should use default load on other files", async () => {
    let called = 0;
    const nextFn = mock.fn(() => (called += 1));
    await load(`file:///test.cjs`, {}, nextFn as any);
    assert.equal(called, 1);
  });

  it("should transpile TypeScript files - module", async () => {
    const root = "/tmp/mockRoot4";
    await setupMockFiles(root, { "file.ts": "let x: string = 'hello';" }, "module");
    const result = await load(`file://${join(root, "file.ts")}`, {}, async () => ({ shortCircuit: false }));
    assert.strictEqual(result.shortCircuit, true);
    assert.strictEqual(result?.format, "module");
    await teardownMockFiles(root);
  });

  it("should transpile TypeScript files - commonjs", async () => {
    const root = "/tmp/mockRoot5";
    await setupMockFiles(root, { "file.ts": "let x: string = 'hello';" }, "commonjs");
    const result = await load(`file://${join(root, "file.ts")}`, {}, async () => ({ shortCircuit: false }));
    assert.strictEqual(result.shortCircuit, true);
    assert.strictEqual(result?.format, "commonjs");
    await teardownMockFiles(root);
  });
});
