import { writeFile } from "node:fs/promises";

import { runLintOnWorkspace, runWithLimitedConcurrency } from "@island.is/scripts";

import { buildOrder } from "./get-build-order.js";

import type { workspaceWithHashes } from "@island.is/scripts/src/lib/generate-hash.js";

const reportJSON = process.env["LINT_REPORT_JSON"];

if (!reportJSON) {
  throw new Error(`Env variable for report not set`);
}

// Order does not matter here.
const tasks = (
  await Promise.all(
    buildOrder
      .reduce((a, b) => [...a, ...b.flat()], [] as workspaceWithHashes[])
      .map((workspace) => runLintOnWorkspace(workspace)),
  )
).flat();

const values = (await runWithLimitedConcurrency(tasks).values).flat();
await writeFile(reportJSON, JSON.stringify(values), "utf-8");
