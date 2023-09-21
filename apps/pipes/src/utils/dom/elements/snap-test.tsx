import assert from "node:assert";
import { basename, dirname, join } from "node:path";
import { it } from "node:test";
import { fileURLToPath } from "node:url";

import { SnapshotState } from "jest-snapshot";

import render from "../../ink/render.js";

import type { ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function toMatchSnapshot(actual: any, testFile: string, testTitle: string) {
  const root = join(fileURLToPath(dirname(testFile)), "__snapshots__");
  const fileName = `${basename(fileURLToPath(testFile))}.snap`;
  const snapshotFile = join(root, fileName);
  console.log(snapshotFile);
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
  assert(result.pass, `${testTitle} ${basename(testFile)} - does not match snapshot`);
};

export const testJSX = async (jsx: ReactNode, name: string, filename: string): Promise<void> => {
  await it(name, async () => {
    const rendered = await render(jsx, true);
    const value = rendered.value();
    console.log(`${name}\n${value}`);
    snapTest(value, filename, name);
  });
};
