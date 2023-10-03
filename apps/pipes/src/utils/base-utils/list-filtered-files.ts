import { readdir } from "node:fs/promises";
import { join } from "node:path";

export type FileType = "TEST_FILES" | "MAIN_FILES" | "ALL";

export const listFilteredFiles = async (dir: string, type: FileType = "TEST_FILES"): Promise<string[]> => {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(dir, entry.name);

      if (entry.isDirectory() && entry.name === "test") continue;

      if (entry.isDirectory()) {
        const subFiles = await listFilteredFiles(entryPath, type);
        files.push(...subFiles);
        continue;
      }
      if (entry.isFile() && /\.(js|mjs|cjs|ts|tsx)$/.test(entry.name)) {
        if (/\.spec\./.test(entry.name) || /\.typespec\./.test(entry.name)) {
          if (type === "TEST_FILES" || type === "ALL") {
            files.push(entryPath);
          }
          continue;
        }
        if (type === "MAIN_FILES" || type === "ALL") {
          files.push(entryPath);
        }
      }
    }
  } catch {}

  return files;
};
