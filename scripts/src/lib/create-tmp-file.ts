import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * @param content {string}
 * @param extension {string}
 * @returns path to file
 */
export const createTmpFile = (content: string, extension: string): string => {
  const filename = `tmpfile-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
  const tmpFilePath = path.join(os.tmpdir(), filename);

  fs.writeFileSync(tmpFilePath, content);

  return tmpFilePath;
};
