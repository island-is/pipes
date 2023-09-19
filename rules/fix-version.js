const readFileSync = require("node:fs").readFileSync;
const join = require("node:path").join;

// eslint-disable-next-line unused-imports/no-unused-vars
const { Yarn } = require("@yarnpkg/types");

/**
 * @param {Yarn.Constraints.Yarn} yarn
 */
const fixVersion = (yarn) => {
  let root = process.cwd();
  for (const workspace of yarn.workspaces()) {
    if (workspace.ident === "@island-is/pipes") {
      root = workspace.cwd;
    }
  }

  const file = join(root, ".version.json");
  const json = readFileSync(file, "utf-8");
  const version = JSON.parse(json).version;
  for (const workspace of yarn.workspaces()) {
    workspace.set("version", version);
  }
  const _rules = require("./rules.js");
  const rules = _rules.default;
  for (const rule of fixVersion.rules) {
    // @ts-ignore
    rules[rule].checked = true;
  }
};

module.exports = { fixVersion };

fixVersion.rules = ["allVersionsShouldBeEqual"];
