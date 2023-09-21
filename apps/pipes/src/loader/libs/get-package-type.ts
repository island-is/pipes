import { dirname, join } from "node:path";

import { fs } from "./fs.js";

export const getPackageType = async (path: string): Promise<"module" | "commonjs"> => {
  try {
    const file = await fs.readFile(join(path, "./package.json"), "utf-8");
    const content = JSON.parse(file);
    if (!("type" in content)) {
      return "commonjs";
    }
    return content["module"] === "module" ? "module" : "commonjs";
  } catch (e) {
    if (dirname(path) === path) {
      throw new Error("Cannot find file");
    }
    return getPackageType(dirname(path));
  }
};
