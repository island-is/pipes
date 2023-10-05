import { type FileResult, file } from "tmp-promise";

import type { FileOptions } from "./interface.js";

type CleanUp = {
  [Symbol.asyncDispose]: () => Promise<void>;
};
export const tmpFile = async (options?: Partial<FileOptions>): Promise<FileResult & CleanUp> => {
  const value = await file(options);
  return {
    ...value,
    [Symbol.asyncDispose]: async () => {
      await value.cleanup();
    },
  };
};
