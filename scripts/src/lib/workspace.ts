/**
 * @file workspace helpers
 */
import { readFile, stat } from "node:fs/promises";
import { dirname, join, sep } from "node:path";

import { listFilteredFiles } from "./file-helper.js";
import { getScriptDirectory } from "./get-script-directory.js";
import { getWorkspaceConfig } from "./pipe-workspace-config.js";

import type { WorkspaceConfig } from "./pipe-workspace-config.js";

export interface Workspace {
  // Name of workspace
  name: string;
  config: WorkspaceConfig;
  // Package type so we can use different lintering rules.
  packageType: "libs" | "scripts" | "pipes-modules" | "base" | "apps" | "ci";
  // Workspace dependencies
  dependencies: {
    dependencies: string[];
    devDependencies: string[];
    peerDependencies: string[];
  };
  // Raw package.json - not typed - sorry!
  rawPackageJSON: any;
  // Absolute path to workspace
  path: string;
  // tsconfig for build and test
  tsconfig: {
    test: string;
    build: string;
  };
  lint: {
    eslint: string;
    prettier: string;
  };
  // Directory with source code
  sourceDirectory: string;
  // Directory with transpiled output
  distDirectory: string;
  // Directory with tests. Should be same as source dode
  testDirectory: string;
  files: {
    source: {
      main: string[];
      test: string[];
    };
    // Entrypoint if it exists
    dist: string | null;
    sourceFile: string | null;
  };
}

const ALLOWED_TYPES: Workspace["packageType"][] = ["ci", "libs", "apps", "base", "scripts", "pipes-modules"];

export const getWorkspaceByDirectory = async (directory: string = process.cwd()): Promise<Workspace> => {
  /**
   * @param {string} currentPath - Directory
   * @returns {Promise<string>} Return path
   */
  const findRoot = async (currentPath: string): Promise<string> => {
    if (currentPath === "/") {
      throw new Error("Could not find root");
    }
    if (!(await stat(join(directory, "./package.json"))).isFile()) {
      return findRoot(join(directory, ".."));
    }
    return currentPath;
  };
  const baseRoot = dirname(getScriptDirectory());
  const projectRoot = await findRoot(directory);
  const packageJSON = JSON.parse(await readFile(join(projectRoot, "package.json"), "utf-8"));
  const hasDist = !!packageJSON.main;
  const hasSource = !!packageJSON.source;
  const files = await listFilteredFiles(join(projectRoot, "./src"));
  const packageType: (typeof ALLOWED_TYPES)[number] = (() => {
    const value = projectRoot.replace(baseRoot, "").split(sep)[1];
    if (!ALLOWED_TYPES.includes(value as (typeof ALLOWED_TYPES)[number])) {
      throw new Error(`Invalid type ${value}`);
    }
    return value as (typeof ALLOWED_TYPES)[number];
  })();
  return {
    name: packageJSON.name,
    config: getWorkspaceConfig(packageJSON),
    packageType: packageType,
    lint: {
      eslint: join(projectRoot, "./.eslintrc.cjs"),
      prettier: join(projectRoot, "./.prettierrc.cjs"),
    },
    dependencies: {
      dependencies: Object.keys(packageJSON["dependencies"] ?? {}),
      devDependencies: Object.keys(packageJSON["devDependencies"] ?? {}),
      peerDependencies: Object.keys(packageJSON["peerDependencies"] ?? {}),
    },
    rawPackageJSON: packageJSON,
    path: projectRoot,
    tsconfig: {
      test: join(projectRoot, "./tsconfig.json"),
      build: join(projectRoot, "./tsconfig.build.json"),
    },
    sourceDirectory: join(projectRoot, "./src"),
    distDirectory: join(projectRoot, "./dist"),
    testDirectory: join(projectRoot, `./src`),
    files: {
      source: {
        main: files.build,
        test: files.test,
      },
      dist: hasDist ? join(projectRoot, packageJSON.main) : null,
      sourceFile: hasSource ? join(projectRoot, packageJSON.source) : null,
    },
  };
};
