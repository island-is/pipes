import { builtinModules } from "node:module";

/**
 * Check if the module is a built-in Node.js module.
 * @param {string} module
 */
export const isBuiltinModule = (module: string): boolean => {
  return module.startsWith("node:") || builtinModules.includes(module);
};
