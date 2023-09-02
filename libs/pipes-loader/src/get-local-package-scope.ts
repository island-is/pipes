import { readFile } from "node:fs/promises";
import { join } from "node:path";

const obj: Record<string, null | string> = {};

export const getLocalPackageScoop = async (rootPath: string): Promise<string | null> => {
  if (typeof obj[rootPath] === "string") {
    return obj[rootPath];
  }
  try {
    const file = join(rootPath, ".yarnrc.yml");
    const data = await readFile(file, "utf-8");
    const content = data.match(/initScope:(.*)\n/g);
    if (!content || !content[0]) {
      return null;
    }
    const initScope = `@${content[0].replaceAll("initScope:", "").replaceAll(" ", "").trim()}/`;
    obj[rootPath] = initScope;
    return initScope;
  } catch {
    return null;
  }
};
