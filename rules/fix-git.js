// eslint-disable-next-line unused-imports/no-unused-vars
const { Yarn } = require("@yarnpkg/types");
/**
 * @param {Yarn.Constraints.Yarn} yarn
 */
const fixGit = (yarn) => {
  // find root
  const root = yarn.workspace().cwd;

  // Create relative path for workspaces
  /**
   *  @param {string} path - path
   * */
  const createRealtivePath = (path) => {
    if (path.startsWith(root)) {
      return path.slice(root.length + 1);
    }
    return path;
  };
  for (const workspace of yarn.workspaces()) {
    if (typeof workspace.manifest === "object" && workspace.manifest?.private) {
      continue;
    }
    workspace.set("license", "MIT");
    workspace.set("repository.type", "git");
    workspace.set("repository.url", "https://github.com/island-is/pipes.git");
    workspace.set("repository.directory", createRealtivePath(workspace.cwd));
  }
  const _rules = require("./rules.js");
  const rules = _rules.default;
  for (const rule of fixGit.rules) {
    // @ts-ignore
    rules[rule].checked = true;
  }
};
fixGit.rules = ["correctGitDefinition"];

module.exports.fixGit = fixGit;
