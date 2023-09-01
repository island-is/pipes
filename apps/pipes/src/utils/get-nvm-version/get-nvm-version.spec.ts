import assert from "node:assert";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { getNvmVersion } from "./get-nvm-version.js";

describe("util-get-nvm-version", () => {
  it("should return version from test file", () => {
    const testDir = join(fileURLToPath(dirname(import.meta.url)), "test");
    assert.strictEqual(getNvmVersion(testDir), "TEST");
  });
});
