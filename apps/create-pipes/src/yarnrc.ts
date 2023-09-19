export const createYARNRC = (): string => {
  return [
    "injectEnvironmentFiles:",
    "   - .env.root?",
    "nmMode: hardlinks-local",
    "nodeLinker: node-modules",
    'npmScopes: { island-is: { npmRegistryServer: "https://npm.pkg.github.com" } }',
  ].join("\n");
};
