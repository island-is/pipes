import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(dirname(dirname(import.meta.url)));
const packageJSONPath = join(rootDir, "package.json");
const packageJSON = JSON.parse(readFileSync(packageJSONPath, "utf-8"));

const deps = packageJSON["dependencies"];
const packageManager = packageJSON["packageManager"].split("yarn@")[1];
const version = packageJSON["version"];

// TODO: This should be auto generated
export const YARN_VERSION = packageManager as string;
export const MOBX_VERSION = deps["mobx"] as string;
export const DAGGER_VERSION = deps["@dagger.io/dagger"] as string;
export const SWC_VERSION = deps["@swc/core"];
export const VERSION = version as string;
