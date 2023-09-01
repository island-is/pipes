import { mkdir, readFile, rm, writeFile } from "fs/promises";
import os from "node:os";
import { basename, dirname, join } from "node:path";

import { glob } from "glob";

import type { Workspace } from "./workspace.js";

export async function preparePublishPackage(workspace: Workspace): Promise<void | string> {
  const { path: workspacePath, config, rawPackageJSON } = workspace;
  if (!config.publishFields || !config.publishFiles) {
    return;
  }
  const filePostfix = basename(workspacePath);
  const tempDir = join(os.tmpdir(), `publish-${filePostfix}`);
  try {
    await rm(tempDir, { recursive: true, force: true });
  } catch {
    // Empty on purpose
  }
  await mkdir(tempDir, { recursive: true });
  const filteredJSON: Record<string, any> = {};
  for (const field of config.publishFields) {
    filteredJSON[field] = rawPackageJSON[field];
  }
  await writeFile(join(tempDir, "package.json"), JSON.stringify(filteredJSON, null, 2));
  for (const pattern of config.publishFiles) {
    const files = glob.sync(pattern, { cwd: workspacePath, nodir: true });
    for (const file of files) {
      const srcPath = join(workspacePath, file);
      const destPath = join(tempDir, file);
      await mkdir(dirname(destPath), { recursive: true });
      const fileData = await readFile(srcPath);
      await writeFile(destPath, fileData);
    }
  }
  return tempDir;
}
