export const isRelativePath = (path: string): boolean => {
  return !/^(?:\/|[a-zA-Z]:\\|https?:\/\/|data:|blob:)/.test(path);
};
