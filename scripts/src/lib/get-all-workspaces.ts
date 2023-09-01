import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { glob } from "glob";

import { getScriptDirectory } from "./get-script-directory.js";
import { getWorkspaceByDirectory } from "./workspace.js";

import type { Workspace } from "./workspace.js";

let AllWorkspaces: Workspace[] | null = null;

export const getAllWorkspaces = async (path: string | undefined = undefined): Promise<Workspace[]> => {
  if (AllWorkspaces) {
    return AllWorkspaces;
  }
  const root = path ?? dirname(getScriptDirectory());
  // Get workspaces
  const json = JSON.parse(await readFile(join(root, "package.json"), "utf-8"));
  const jsonWorkspaces = (json.workspaces as string[]).map((e) => {
    return join(root, ...e.split("/"), "package.json");
  });
  const values = await Promise.all(
    (await glob(jsonWorkspaces)).map((e) => getWorkspaceByDirectory(e.replace("package.json", ""))),
  );
  AllWorkspaces = values.filter((e) => e.config.skipGlobalResolution === false);
  return AllWorkspaces;
};
