import { writeFile } from "node:fs/promises";

import { runBuildOnWorkspace, runWithLimitedConcurrency } from "@island-is/scripts";

import { buildOrder } from "./get-build-order.js";

import type { RunnerDetails, RunnerError } from "@island-is/scripts";
const reportJSON = process.env["BUILD_REPORT_JSON"];

if (!reportJSON) {
  throw new Error(`Invalid env for report json`);
}
let values: (RunnerError | RunnerDetails)[] = [];

for (const build of buildOrder) {
  const tasks = build
    .map((e: any) => runBuildOnWorkspace(e).flat())
    .flat()
    .filter(Boolean);
  if (tasks.length !== 0) {
    const newValues = await Promise.all((await runWithLimitedConcurrency(tasks).values).flat());
    values = [...values, ...newValues];
  }
}
const runnerSuccess = [...values.filter((e): e is RunnerDetails => e.status === "Success").map((e) => e)].flat();
const runnerError = [...values.filter((e): e is RunnerError => e.status === "Error")].map((e) => e).flat();

await writeFile(reportJSON, JSON.stringify([...runnerSuccess, ...runnerError].flat()), "utf-8");
