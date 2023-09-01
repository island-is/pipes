import { readFile } from "node:fs/promises";
import { join, sep } from "node:path";

import { glob } from "glob";
export interface LocalPackage {
  name: string;
  source: string;
}
export const getAllWorkspaces = async (root: string): Promise<Record<string, LocalPackage>> => {
  // Get workspaces
  const json = JSON.parse(await readFile(join(root, "package.json"), "utf-8"));
  const jsonWorkspaces = (json.workspaces as string[]).map((e) => {
    return join(root, ...e.split("/"), "package.json");
  });
  const projects: Record<string, LocalPackage> = {};
  const values = (
    await Promise.all(
      (await glob(jsonWorkspaces)).map(async (e) => {
        const content = JSON.parse(await readFile(e, "utf-8"));
        const relative = "source" in content ? content.source : content.dist;
        if (!relative) {
          return null;
        }
        const workspaceRoot = e.replace(`package.json`, "");
        const absolutePath = `${sep}${join(...workspaceRoot.split(sep), ...relative.split("/"))}`;
        const name = content.name;
        return {
          name: name,
          source: absolutePath,
        };
      }),
    )
  ).filter((e): e is LocalPackage => !!e);
  for (const value of values) {
    projects[value.name] = value;
  }
  return projects;
};
