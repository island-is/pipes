export const createEnv = (): string => {
  const NODE_ENV = [
    "NODE_OPTIONS=",
    "--no-warnings=ExperimentalWarning",
    "--enable-source-maps",
    "--experimental-loader=@island.is/pipes-core/loader.mjs",
  ].join("");
  return [`FORCE_COLOR=2`, NODE_ENV].join("\n");
};
