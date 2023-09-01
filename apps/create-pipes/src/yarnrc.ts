export const createYARNRC = (): string => {
  return ["injectEnvironmentFiles:", "   - .env.root", "nmMode: hardlinks-local", "nodeLinker: node-modules"].join(
    "\n",
  );
};
