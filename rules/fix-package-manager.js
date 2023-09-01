const { execSync } = require("child_process");
const { readFileSync } = require("fs");
const { dirname, join } = require("path");

// eslint-disable-next-line unused-imports/no-unused-vars
const { Yarn } = require("@yarnpkg/types");

/** @type {string} */
let yarnVersion;

try {
  yarnVersion = execSync("yarn --version", { encoding: "utf8" });
} catch (error) {
  throw new Error("Could not set yarn version :(");
}

const nodeVersion = readFileSync(join(dirname(__dirname), ".nvmrc"), "utf-8").trim();

/**
 * @param {Yarn.Constraints.Yarn} yarn
 */
const fixPackageManager = (yarn) => {
  for (const workspace of yarn.workspaces()) {
    workspace.set("packageManager", `yarn@${yarnVersion.trim()}`);
    const engines = {
      node: nodeVersion,
      yarn: yarnVersion.trim(),
      npm: "please use yarn",
      pnpm: "please use yarn",
    };
    const currentEngines =
      workspace.manifest && typeof workspace.manifest === "object" ? workspace.manifest.engines || {} : {};
    if (
      (typeof currentEngines === "object" &&
        (engines.node !== currentEngines.node ||
          engines.yarn !== currentEngines.yarn ||
          engines.npm !== currentEngines.npm ||
          engines.pnpm !== currentEngines.pnpm)) ||
      Array.from(new Set([...Object.keys(currentEngines), ...Object.keys(engines)])).length !==
        Object.keys(engines).length
    ) {
      workspace.set("engines", engines);
    }
  }
  const _rules = require("./rules.js");
  const rules = _rules.default;
  for (const rule of fixPackageManager.rules) {
    // @ts-ignore
    rules[rule].checked = true;
  }
};
fixPackageManager.rules = ["packageManager", "typeNodeShouldBeOfCorrectVersion", "everyProjectShouldHaveEngine"];

module.exports.fixPackageManager = fixPackageManager;
