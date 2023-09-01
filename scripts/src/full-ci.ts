// Test for full ci
import { generateHashesFromBuild } from "./lib/generate-hash.js";
import { getAllWorkspaces as getAllWorkspaces } from "./lib/get-all-workspaces.js";
import { getBuildOrder } from "./lib/get-build-orders.js";
import { runWithLimitedConcurrency } from "./lib/get-thread-count.js";
import { preparePublishPackage } from "./lib/prepare-publish-package.js";
import { buildWorkspace, runBuildOnWorkspace } from "./run-build.js";
import { runLintOnWorkspace } from "./run-lint.js";
import { runTestOnWorkspace } from "./run-test.js";

// Get all workspaces
const workspaces = await getAllWorkspaces();

const buildOrder = await generateHashesFromBuild(getBuildOrder(workspaces));

// We ignore hashes for now. Always doing fresh build.

// Lint needs nothing - we do it all at once.
const lintTasks = await (
  await Promise.all(
    buildOrder
      .flat()
      .map((workspace) => {
        return (async () => {
          const value = await runLintOnWorkspace(workspace);
          return value;
        })();
      })
      .flat(),
  )
).flat();

const publishBuilds = buildOrder
  .flat()
  .filter((workspace) => workspace.config.publishFields && workspace.config.publishFiles);

// Build a package then test it. This is run in steps.
// Build Order created array:
// [dep1, dep2], [dep3], [dep4]
// where in the first array packages need no dependencies
// second depend on first… and so on…

const buildAndTest = (
  await Promise.all(
    buildOrder
      .map((buildWorkspaces) => {
        const tasks = buildWorkspaces
          .map((workspace) => {
            const buildResults = runBuildOnWorkspace(workspace);
            return [...buildResults];
          })
          .flat();

        return tasks;
      })
      .flat(),
  )
).flat();

const values = (await runWithLimitedConcurrency([...buildAndTest]).values).flat(10);

/* const errors = values.filter((e) => {
  return e && typeof e === "object" && e.status === "Error";
}); */

console.log(values);

// eslint-disable-next-line no-console
// console.error(errors);
const publishValues = await Promise.all(
  publishBuilds.map((workspace) => {
    return preparePublishPackage(workspace);
  }),
);

console.log({ publishValues });
