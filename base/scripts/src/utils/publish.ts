import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { getWorkspaceConfig } from "./config.js";

export async function preparePublishPackage(workspacePath: string, version: string): Promise<void | string> {
  const rawPackageJSON = JSON.parse(await readFile(join(workspacePath, "package.json"), "utf-8"));
  const config = getWorkspaceConfig(rawPackageJSON);
  if (!config.publishFields || !config.publishFiles) {
    return;
  }
  const distDir = join(workspacePath, "dist");
  const filteredJSON: Record<string, any> = {};
  for (const field of config.publishFields) {
    filteredJSON[field] = rawPackageJSON[field];
  }

  filteredJSON["dependencies"] = filteredJSON["dependencies"] || {};
  Object.keys(filteredJSON["dependencies"]).forEach((e) => {
    if (e.startsWith("@island-is")) {
      filteredJSON["dependencies"][e] = version;
    }
  });
  filteredJSON["version"] = version;
  Object.keys(config.publishFieldsOverwrite).forEach((e) => {
    filteredJSON[e] = config.publishFieldsOverwrite[e];
  });

  await writeFile(join(distDir, "package.json"), JSON.stringify(filteredJSON, null, 2));
  return;
}
