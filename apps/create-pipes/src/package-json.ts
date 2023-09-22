interface Props {
  name: string;
  version: string;
  yarnVersion: string;
}
export const PackageJSON = ({ name, version, yarnVersion }: Props): string => {
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
        "@island-is/pipes-core": version,
      },
    },
    null,
    2,
  );
};
