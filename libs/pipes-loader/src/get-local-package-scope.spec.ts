import assert from "node:assert";
import { promises as fsPromises } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { getLocalPackageScoop } from "./get-local-package-scope.js";
const { writeFile, rmdir, mkdir } = fsPromises;

async function setupMockProject(root: string, initScope: string | null) {
  await mkdir(root, { recursive: true });
  if (initScope !== null) {
    const content = `initScope: ${initScope}\n`;
    await writeFile(join(root, ".yarnrc.yml"), content);
  }
}

async function teardownMockProject(root: string) {
  await rmdir(root, { recursive: true });
}

describe("getLocalPackageScoop", () => {
  it("should return the correct scope", async () => {
    const root = "/tmp/mockProject1";
    await setupMockProject(root, "myscope");
    const scope = await getLocalPackageScoop(root);
    assert.strictEqual(scope, "@myscope/");
    await teardownMockProject(root);
  });

  it("should return null if initScope is not found", async () => {
    const root = "/tmp/mockProject2";
    await setupMockProject(root, null);
    const scope = await getLocalPackageScoop(root);
    assert.strictEqual(scope, null);
    await teardownMockProject(root);
  });

  it("should cache the result for subsequent calls", async () => {
    const root1 = "/tmp/mockProject3";
    const root2 = "/tmp/mockProject4";
    await setupMockProject(root1, "myscope");
    await setupMockProject(root2, "otherscope");

    const scope1 = await getLocalPackageScoop(root1);
    const scope2 = await getLocalPackageScoop(root2);
    const scope3 = await getLocalPackageScoop("/tmp/mockProject1");
    assert.strictEqual(scope1, "@myscope/");
    assert.strictEqual(scope3, "@myscope/");
    assert.strictEqual(scope2, "@otherscope/");

    await teardownMockProject(root1);
    await teardownMockProject(root2);
  });
});
