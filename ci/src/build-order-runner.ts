import { writeFile } from "node:fs/promises";

import { generateHashesFromBuild, getAllWorkspaces, getBuildOrder } from "@island.is/scripts";

const sourceDir = process.env["PROJECT_ROOT"] || process.cwd();

const reportJSON = process.env["BUILD_ORDER_JSON"];

if (!reportJSON) {
  throw new Error(`Invalid env for report json`);
}
const value = await generateHashesFromBuild(getBuildOrder(await getAllWorkspaces(sourceDir)));

await writeFile(reportJSON, JSON.stringify(value, null, 2));
