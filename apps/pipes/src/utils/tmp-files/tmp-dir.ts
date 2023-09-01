import { type DirectoryResult, dir } from "tmp-promise";

import type { DirOptions } from "./interface.js";

type CleanUp = {
  [Symbol.asyncDispose]: () => Promise<void>;
};
export const tmpDir = async (options?: Partial<DirOptions>): Promise<DirectoryResult & CleanUp> => {
  const value = await dir(options);
  return {
    ...value,
    [Symbol.asyncDispose]: async () => {
      await value.cleanup();
    },
  };
};
