export const isRelativePath = (path: string): boolean => {
  return path.startsWith("./") || path.startsWith("../");
};
