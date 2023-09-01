const fixPackageManager = require("./fix-package-manager").fixPackageManager;
const fixModule = require("./fix-module").fixModule;
const fixType = require("./fix-type.js").fixType;
const fixGit = require("./fix-git.js").fixGit;
const fixVersions = require("./fix-versions.js").fixVersions;
const fixVersion = require("./fix-version.js").fixVersion;

const obj = {
  allVersionsShouldBeEqual: {
    description: "All packages follow release schedule",
    fn: fixVersion,
  },
  typeNodeShouldBeOfCorrectVersion: {
    description: "Be sure that we are using same type as the node we are using",
    fn: fixPackageManager,
  },
  everyProjectShouldHaveEngine: {
    description: "Force correct engine with yarn and node, disable npm and pnpm",
    fn: fixPackageManager,
  },
  packageManager: {
    description: "Same version in all project",
    fn: fixPackageManager,
  },
  moduleTypeDefined: {
    description:
      "Since this is a ESM project, we should define in package.json that it is an ESM unless CJS is specially needed",
    fn: fixModule,
  },
  realtiveMainAndTypes: {
    description: "Main and types should be REALTIVE",
    fn: fixType,
  },
  correctGitDefinition: {
    description: "Every workspace should have correct git definition",
    fn: fixGit,
  },
  allVersionsShouldBeClean: {
    description: "All versions should be clean, not include ^ or something",
    fn: fixVersions,
  },
  onlyOneVersionWholeProject: {
    description: "Whole project should only have one version of every package ideally",
    fn: fixVersions,
  },
  peerDependencyShoulBeWildcard: {
    description: "Allow any version in peer for now",
    fn: fixVersions,
  },
  peerDependencyShouldBeListedAsDevDependency: {
    description: "Ever peer dependency should be also in dev dependencyu",
    fn: fixVersions,
  },
};
module.exports.default = obj;
