import { writeFile } from "node:fs/promises";

import { Shell, preparePublishPackage } from "@island.is/scripts";

import * as getBuildOrderJs from "./get-build-order.js";

const buildOrderJSON = process.env["BUILD_ORDER_JSON"];
const reportJSON = process.env["TEST_REPORT_JSON"];
if (!buildOrderJSON) {
  throw new Error(`Env for build order not initialized`);
}
if (!reportJSON) {
  throw new Error(`Invalid env for report json`);
}
const publishBuilds = getBuildOrderJs.buildOrder
  .flat()
  .filter((workspace) => workspace.config.publishFields && workspace.config.publishFiles);
const report: { packageFailed: string[]; packageSuccess: string[] } = { packageFailed: [], packageSuccess: [] };
const publishValues = (
  await Promise.all(
    publishBuilds.map(async (workspace) => {
      const value = await preparePublishPackage(workspace);
      if (!value) {
        report.packageFailed.push(workspace.name);
      } else {
        report.packageSuccess.push(workspace.name);
      }
      return value ?? null;
    }),
  )
).filter((e): e is string => !!e);

for (const pkg of publishValues) {
  // run cwd and wait
  await Shell.execute("npm", ["publish"], { cwd: pkg });
}
await writeFile(reportJSON, JSON.stringify(report), "utf-8");
