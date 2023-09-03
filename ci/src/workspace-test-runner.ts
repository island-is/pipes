import { writeFile } from "node:fs/promises";

import { checkPackages, runWithLimitedConcurrency } from "@island-is/scripts";

const reportJSON = process.env["WORKSPACE_TEST_REPORT_JSON"];

if (!reportJSON) {
  throw new Error(`Invalid env for report json`);
}
export const workspaceTestRunnerValue = (await runWithLimitedConcurrency(checkPackages()).values).flat();

await writeFile(reportJSON, JSON.stringify(workspaceTestRunnerValue.flat()), "utf-8");
