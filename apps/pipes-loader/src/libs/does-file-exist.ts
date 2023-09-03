import { fs } from "./fs.js";

/**
 * @param path - path to fs
 * @returns true if file exists, else false.
 */
export async function doesFileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}
