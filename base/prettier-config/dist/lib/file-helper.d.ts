/**
 * @file Tool to help with file listing, delete etc.
 */
/**
 * Clear directory
 * @param {string} dir - path to remove
 * @returns {Promise<void>} List of all files to build
 */
export declare const emptyDirectory: (dir: string) => Promise<void>;
/**
 * Get all files to build
 * @param {string} dir - path to scan
 * @returns {Promise<{build: string[]; test: string[]}>} List of all files to build
 */
export declare const listFilteredFiles: (dir: string) => Promise<{
    build: string[];
    test: string[];
}>;
