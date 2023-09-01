// eslint-disable-next-line unused-imports/no-unused-vars
const { Yarn } = require("@yarnpkg/types");
const semver = require("semver");

/**
 * @param {Yarn.Constraints.Yarn} yarn
 */
const fixVersions = (yarn) => {
  /**
   *
   * @param {string} version
   * @param {string} name
   * @param {Record<string, string>} storage
   * @returns
   */
  const updateVersion = (version, name, storage) => {
    if (version === "workspace:*") {
      storage[name] = "workspace:*";
      return;
    }
    // rules.allVersionShouldBeClean
    version = version.replace(/^[^\d]+/, "");
    if (semver.valid(version)) {
      if (semver.gt(version, storage[name] || "0.0.0")) {
        storage[name] = version;
      }
    } else {
      if (!storage[name]) {
        storage[name] = version;
      }
    }
  };
  /** @type {Record<string, string>} */
  const depStorage = {};
  for (const dep of yarn.dependencies()) {
    const name = dep.ident;
    const version = dep.range;
    updateVersion(version, name, depStorage);
  }
  for (const dep of yarn.dependencies()) {
    const name = dep.ident;
    if (dep.type !== "peerDependencies") {
      // rules.onlyOneVersionWholeProject
      dep.update(depStorage[name]);
    }
  }
  for (const dep of yarn.dependencies()) {
    if (dep.type === "peerDependencies") {
      const devDependency =
        (typeof dep.workspace.manifest === "object" ? dep.workspace.manifest?.devDependencies : {}) ?? {};
      // rules.peerDependencyShouldBeWildcard
      dep.update("*");
      if (!Object.keys(devDependency).includes(dep.ident)) {
        dep.workspace.set(["devDependencies", dep.ident], depStorage[dep.ident]);
      }
    }
  }
  const _rules = require("./rules.js");
  const rules = _rules.default;
  for (const rule of fixVersions.rules) {
    // @ts-ignore
    rules[rule].checked = true;
  }
};
fixVersions.rules = [
  "allVersionsShouldBeClean",
  "onlyOneVersionWholeProject",
  "peerDependencyShoulBeWildcard",
  "peerDependencyShouldBeListedAsDevDependency",
];

module.exports.fixVersions = fixVersions;
