import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { DAGGER_VERSION, MOBX_VERSION, SWC_VERSION, VERSION, YARN_VERSION } from "./const.js";
import * as createPipes from "./create-pipes.js";

describe("create-pipes", () => {
  describe("all versions are defined", () => {
    assert(typeof YARN_VERSION === "string");
    assert(typeof MOBX_VERSION === "string");
    assert(typeof DAGGER_VERSION === "string");
    assert(typeof SWC_VERSION === "string");
    assert(typeof VERSION === "string");
  });
  describe("getAppPaths", () => {
    it("should return correct paths", () => {
      const { appPath, srcPath } = createPipes.getAppPaths(process.cwd(), "myApp");
      assert.strictEqual(appPath, `${process.cwd()}/myApp`);
      assert.strictEqual(srcPath, `${process.cwd()}/myApp/src`);
    });
  });
  it("should create the app successfully", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "create-pipes-"));

    createPipes.main(tempDir, "appName");
    const rootDir = path.join(tempDir, "appName");

    assert(fs.existsSync(path.join(rootDir, "src", "ci.ts")));
    assert(fs.existsSync(path.join(rootDir, "yarn.lock")));
    assert(fs.existsSync(path.join(rootDir, "package.json")));
    assert(fs.existsSync(path.join(rootDir, ".yarnrc.yml")));

    const packageJsonContent = fs.readFileSync(path.join(rootDir, "package.json"), "utf8");
    assert(packageJsonContent.includes('"name": "appName"'));

    fs.rmdirSync(tempDir, { recursive: true });
  });
});
