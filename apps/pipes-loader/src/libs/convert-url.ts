import { fileURLToPath } from "node:url";

/**
 * Converts string from file URL to path if needed.
 *
 * @param file File path or URL string
 * @returns null if wrong protocool, else string.
 */
export function convertURL(file: string | undefined | null): string | null {
  if (!file) {
    return null;
  }
  try {
    const url = new URL(file);
    if (url.protocol !== "file:") {
      return null;
    }
    return fileURLToPath(url);
  } catch {
    // empty on purpose
  }
  return file;
}
