import assert from "node:assert";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { SnapshotState } from "jest-snapshot";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function toMatchSnapshot(actual: any, testFile: string, testTitle: string) {
  const root = join(fileURLToPath(dirname(testFile)), "__snapshots__");
  const fileName = `${basename(fileURLToPath(testFile))}.snap`;
  const snapshotFile = join(root, fileName);
  const snapshotState = new SnapshotState(snapshotFile, {
    updateSnapshot: process.env.SNAPSHOT_UPDATE ? "all" : "new",
  } as any);

  const matcher = snapshotState.match({
    testName: `${testTitle}-${testFile}`,
    received: actual,
    isInline: false,
  });

  const result = matcher;
  snapshotState.save();

  return result;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const snapTest = (actual: any, testFile: string, testTitle: string) => {
  const result = toMatchSnapshot(actual, testFile, testTitle);
  assert(result.pass, `${testTitle} - does not match snapshot`);
};
