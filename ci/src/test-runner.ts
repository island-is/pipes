import { writeFile } from "node:fs/promises";

import { runTestOnWorkspace, runWithLimitedConcurrency } from "@island.is/scripts";

import { buildOrder } from "./get-build-order.js";

import type { RunnerDetails, RunnerError } from "@island.is/scripts";
const buildOrderJSON = process.env["BUILD_ORDER_JSON"];
const reportJSON = process.env["TEST_REPORT_JSON"];
if (!buildOrderJSON) {
  throw new Error(`Env for build order not initialized`);
}
if (!reportJSON) {
  throw new Error(`Invalid env for report json`);
}
let values: (RunnerError | RunnerDetails)[] = [];

for (const build of buildOrder) {
  const tasks = build
    .map((e: any) => runTestOnWorkspace(e).flat())
    .flat()
    .filter(Boolean);
  if (tasks.length !== 0) {
    const newValues = await Promise.all((await runWithLimitedConcurrency(tasks).values).flat());
    values = [...values, ...newValues];
  }
}
await writeFile(reportJSON, JSON.stringify([...values].flat()), "utf-8");
