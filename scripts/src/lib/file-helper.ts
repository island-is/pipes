import { readdir, rmdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
/**
 * @file Tool to help with file listing, delete etc.
 */

/**
 * Clear directory
 * @param dir - path to remove
 * @returns List of all files to build
 */

export const emptyDirectory: (dir: string) => Promise<void> = async (dir: string) => {
  try {
    const entries = await readdir(dir);

    await Promise.all(
      entries.map(
        /**
         * @param {string} entry -string
         */
        async (entry) => {
          const fullPath = join(dir, ".", entry);

          if (await stat(fullPath).then((_stat) => _stat.isDirectory())) {
            await rmdir(fullPath);
          } else {
            await unlink(fullPath);
          }
        },
      ),
    );
  } catch {}
};
/**
 * Get all files to build
 * @param {string} dir - path to scan
 * @returns {Promise<{build: string[]; test: string[]}>} List of all files to build
 */
export const listFilteredFiles = async (dir: string): Promise<{ build: string[]; test: string[] }> => {
  const buildFiles = [];
  const testFiles = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(dir, entry.name);

      if (entry.isDirectory() && entry.name === "test") continue;

      if (entry.isDirectory()) {
        const subFiles = await listFilteredFiles(entryPath);
        buildFiles.push(...subFiles.build);
        testFiles.push(...subFiles.test);
        continue;
      }

      if (entry.isFile() && /\.(js|mjs|cjs|ts|tsx)$/.test(entry.name)) {
        if (/\.spec\./.test(entry.name) || /\.typespec\./.test(entry.name)) {
          testFiles.push(entryPath);
          continue;
        }
        buildFiles.push(entryPath);
      }
    }
  } catch {}

  return {
    build: buildFiles,
    test: testFiles,
  };
};
