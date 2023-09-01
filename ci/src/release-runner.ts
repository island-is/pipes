import { writeFile } from "node:fs/promises";

import { Shell, preparePublishPackage } from "@island.is/scripts";

import * as getBuildOrderJs from "./get-build-order.js";
import { join } from "node:path";

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
const report: {
  token: string;
  packageFailed: string[];
  packageSuccess: string[];
  error: Record<string, any>;
  msg: Record<string, any>;
} = {
  token: process.env["NODE_AUTH_TOKEN"] ?? "NOT SET",
  packageFailed: [],
  packageSuccess: [],
  error: {},
  msg: {},
};
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

console.log(process.env.NODE_AUTH_TOKEN);
for (const pkg of publishValues) {
  // run cwd and wait
  try {
    const code = `//npm.pkg.github.com/:_authToken=${process.env["NODE_AUTH_TOKEN"]}\n
@island-is:registry=https://npm.pkg.github.com/\n
always-auth=false\n
`;
    // THIS SHOULD BE ADDED TO A MODULE
    await writeFile(join(pkg, ".npmrc"), code, "utf-8");
    await Shell.execute("npm", ["publish"], { cwd: pkg });
    const value = await Shell.execute("yarn", ["publish"], { cwd: pkg });
    report.msg[pkg] = value;
  } catch (e) {
    report.error[pkg] = e;
  }
}
await writeFile(reportJSON, JSON.stringify(report), "utf-8");
