import { dirname, join } from "node:path";

import { getScriptDirectory } from "./get-script-directory.js";

import type * as Iz from "@island-is/zod";

// Libraries outside scripts might not be ready;
const root = dirname(getScriptDirectory());
const zodSource = join(root, "libs", "zod", "src", "zod.ts");
const value = (await import(zodSource)) as typeof Iz;
export const z = value;
export type zinfer<T extends Iz.ZodType<any, any, any>> = Iz.infer<T>;
