import { lstat, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export const doesFileExists = (file: string): Promise<boolean> =>
  lstat(file)
    .catch(() => false)
    .then(() => true);

interface Props {
  extension?: string;
  directory?: boolean;
  path: string;
}

export const getFilesFromPath = async (props: Props): Promise<string[]> => {
  const files = (await readdir(props.path)).map((e) => join(props.path, e));
  if (props.extension) {
    return files.filter((file) => file.endsWith(props.extension!));
  }
  if (props.directory) {
    return Promise.all(
      files.filter(async (file) => {
        const fileStat = await stat(join(props.path, file));
        return fileStat.isDirectory();
      }),
    );
  }
  return files ?? [];
};
