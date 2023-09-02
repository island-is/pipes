import { dirname, join } from "node:path";

import { fs } from "./fs.js";

export const getPackageType = async (path: string): Promise<unknown> => {
  try {
    const file = await fs.readFile(join(path, "./package.json"), "utf-8");
    const content = JSON.parse(file);
    if (!("module" in content)) {
      return "commonjs";
    }
    return content["module"] === "module" ? "module" : "commonjs";
  } catch {
    return getPackageType(dirname(path));
  }
};
