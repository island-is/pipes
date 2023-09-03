interface Props {
  name: string;
  version: string;
  yarnVersion: string;
  daggerVersion: string;
  mobxVersion: string;
  swcVersion: string;
}
export const PackageJSON = ({ mobxVersion, daggerVersion, swcVersion, name, version, yarnVersion }: Props): string => {
  return JSON.stringify(
    {
      name,
      version: "0.0.1",
      packageManager: `yarn@${yarnVersion}`,
      type: "module",
      scripts: {
        dev: "node src/ci.tsx",
      },
      dependencies: {
        "@island.is/pipes-core": version,
        "@island.is/pipes-loader": version,
        "@swc/core": swcVersion,
        "@dagger.io/dagger": daggerVersion,
        mobx: mobxVersion,
      },
    },
    null,
    2,
  );
};
