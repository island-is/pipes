// eslint-disable-next-line unused-imports/no-unused-vars
const { Yarn } = require("@yarnpkg/types");
/**
 * @param {Yarn.Constraints.Yarn} yarn
 */
const fixType = (yarn) => {
  for (const workspace of yarn.workspaces()) {
    ["main", "types", "dist", "typings", "source"].forEach((field) => {
      // @ts-ignore
      const fieldValue = workspace.manifest?.[field] ?? null;
      if (fieldValue && !fieldValue.startsWith("./")) {
        workspace.set(field, `./${fieldValue}`);
      }
    });
  }
  const _rules = require("./rules.js");
  const rules = _rules.default;
  for (const rule of fixType.rules) {
    // @ts-ignore
    rules[rule].checked = true;
  }
};
fixType.rules = ["realtiveMainAndTypes"];

module.exports.fixType = fixType;
