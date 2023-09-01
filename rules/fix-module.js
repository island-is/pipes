// eslint-disable-next-line unused-imports/no-unused-vars
const { Yarn } = require("@yarnpkg/types");
/**
 * @param {Yarn.Constraints.Yarn} yarn
 */
const fixModule = (yarn) => {
  for (const workspace of yarn.workspaces()) {
    const type = workspace.manifest && typeof workspace.manifest === "object" ? workspace.manifest.type : null;
    if (type !== "commonjs") {
      workspace.set("type", "module");
    }
  }
  const _rules = require("./rules.js");
  const rules = _rules.default;
  for (const rule of fixModule.rules) {
    // @ts-ignore
    rules[rule].checked = true;
  }
};
fixModule.rules = ["moduleTypeDefined"];

module.exports.fixModule = fixModule;
