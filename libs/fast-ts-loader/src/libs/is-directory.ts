import { fs } from "./fs.js";
/**
 * @param path - path in the fs.
 */
export const isDirectory = async (path: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
};
