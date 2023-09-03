import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { findPnpRoot } from "@island-is/find-pnp-root";

export const getDaggerVersion = async (): Promise<string> => {
  const root = findPnpRoot(process.cwd());

  const yarnLockContent = await readFile(join(root, "yarn.lock"), "utf8");
  const REGEX = /^"@dagger.io\/dagger@.*":\n.*version:\s*(.*)\n/m;
  const match = yarnLockContent.match(REGEX);

  if (match && match[1]) {
    return match[1].trim();
  }
  throw new Error("Could not find version of '@dagger.io/dagger' in yarn.lock");
};
