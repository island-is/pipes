import { dirname, join } from "node:path";

import { getScriptDirectory } from "./get-script-directory.js";

import type { onCleanup as IonCleanup } from "@island-is/cleanup";

// Libraries outside scripts might not be ready;
const root = dirname(getScriptDirectory());
const cleanupSource = join(root, "libs", "cleanup", "src", "cleanup.ts");
const value = await import(cleanupSource);

export const onCleanup = value.onCleanup as typeof IonCleanup;
