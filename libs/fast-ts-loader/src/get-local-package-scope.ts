import { readFile } from "fs/promises";
import { join } from "path";

let obj: null | string = null;

export const getLocalPackageScoop = async (rootPath: string): Promise<string> => {
  if (typeof obj === "string") {
    return obj;
  }
  const file = join(rootPath, ".yarnrc.yml");
  const data = await readFile(file, "utf-8");
  const content = data.match(/initScope:(.*)\n/g);
  if (!content || !content[0]) {
    throw new Error("Could not find initScope");
  }
  const initScope = `@${content[0].replaceAll("initScope:", "").replaceAll(" ", "").trim()}/`;
  obj = initScope;
  return initScope;
};
