import assert from "node:assert";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { findPnpRoot } from "./find-pnp-root.js";

const __dirname = fileURLToPath(dirname(import.meta.url));

test("should return base dir from test/test/test2", () => {
  const baseName = join(__dirname, "test");
  const testPath = join(baseName, "test", "test2");
  assert.strictEqual(findPnpRoot(testPath), baseName);
});

test("should return Base Dir from test/test", () => {
  const baseName = join(__dirname, "test");
  const testPath = join(baseName, "test");
  assert.strictEqual(findPnpRoot(testPath), baseName);
});

test("should return Base Dir from test", () => {
  const baseName = join(__dirname, "test");
  const testPath = baseName;
  assert.strictEqual(findPnpRoot(testPath), baseName);
});

test("should fail from root", () => {
  const testPath = "/";
  const fn = () => {
    findPnpRoot(testPath);
  };
  assert.throws(fn, "Could not find .yarnrc.yml file");
});
