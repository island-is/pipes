import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(dirname(dirname(import.meta.url)));
const packageJSONPath = join(rootDir, "package.json");
const packageJSON = JSON.parse(readFileSync(packageJSONPath, "utf-8"));

const packageManager = packageJSON["packageManager"].split("yarn@")[1];
const version = packageJSON["version"];

// TODO: This should be auto generated
export const YARN_VERSION = packageManager as string;
export const VERSION = version as string;
