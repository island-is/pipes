import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import type { Workspace } from "./workspace.js";

type BuildOrder = Workspace[][];
export type workspaceWithHashes = Workspace & { hash: { build?: string; lint?: string; test?: string } };

export const generateHashesFromBuild = async (build: BuildOrder): Promise<workspaceWithHashes[][]> => {
  let mainlintHash: string | null = null;
  const results: Array<workspaceWithHashes[]> = [];
  for (const workspaces of build) {
    const hash = await Promise.all(
      workspaces.map((workspace) => {
        return generateWorkspaceHashes(workspace, mainlintHash);
      }),
    );

    const lintchanger = workspaces
      .filter((e) => {
        return e.config.changesGlobalLintHash;
      })
      .map((_e, index) => {
        return hash[index];
      })
      .join("");
    if (lintchanger !== "") {
      if (typeof mainlintHash === "string") {
        mainlintHash += lintchanger;
      } else {
        mainlintHash = lintchanger;
      }
    }
    results.push(
      workspaces.map((workspace, index) => {
        return {
          ...workspace,
          hash: hash[index],
        };
      }),
    );
  }
  return results;
};

export async function generateWorkspaceHashes(
  workspace: Workspace,
  extraHash: string | null = null,
): Promise<{ build?: string; test?: string; lint?: string }> {
  const hashes: { build?: string; test?: string; lint?: string } = {};
  const filesToHash: string[] = [];
  const options = {
    skipBuild: workspace.config.skipBuild,
    skipTest: workspace.config.skipTest,
    skipLint: workspace.config.skipLint,
  };
  // We use set later on, so duplication is OK
  if (!options.skipBuild) {
    filesToHash.push(workspace.tsconfig.build);
    workspace.files.source.main.forEach((e) => filesToHash.push(e));
  }
  if (!options.skipTest) {
    filesToHash.push(workspace.tsconfig.build);
    workspace.files.source.main.forEach((e) => filesToHash.push(e));
    workspace.files.source.test.forEach((e) => filesToHash.push(e));
  }
  if (!options.skipLint) {
    Object.values(workspace.lint).forEach((e) => filesToHash.push(e));
    workspace.files.source.main.forEach((e) => filesToHash.push(e));
    workspace.files.source.test.forEach((e) => filesToHash.push(e));
  }

  const uniqueFiles = [...new Set(filesToHash)];
  const fileContents: Map<string, string> = new Map();
  for (const filePath of uniqueFiles) {
    fileContents.set(filePath, await getFileContent(filePath));
  }

  const deps = [...workspace.dependencies.dependencies, ...workspace.dependencies.peerDependencies].join(",");

  if (!options.skipBuild) {
    const buildData =
      [workspace.tsconfig.build, ...workspace.files.source.main].map((path) => fileContents.get(path)!).join("") + deps;
    hashes.build = generateHash(buildData);
  }

  if (!options.skipTest) {
    const testData =
      [workspace.tsconfig.test, ...workspace.files.source.main, ...workspace.files.source.test]
        .map((path) => fileContents.get(path)!)
        .join("") + deps;
    hashes.test = generateHash(testData);
  }

  if (!options.skipLint) {
    const lintData =
      [workspace.tsconfig.test, ...workspace.files.source.main, ...workspace.files.source.test]
        .map((path) => fileContents.get(path)!)
        .join("") + (extraHash || "");
    hashes.lint = generateHash(lintData);
  }

  return hashes;
}

function generateHash(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

async function getFileContent(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf-8");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to read file: ${filePath}`);
    return "";
  }
}
