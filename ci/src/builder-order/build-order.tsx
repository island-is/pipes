import { dirname, join } from "node:path/posix";
import { fileURLToPath } from "node:url";

import { createPipesCore } from "@island-is/pipes-module-core";
import { PipesNode, type PipesNodeModule } from "@island-is/pipes-module-node";

import { devImageKey, devWorkDir } from "../install/dev-image.js";
import { testReport } from "../report.js";
import { PipesDOM, render } from "@island-is/pipes-core";

/**
 * This calculates the build order and injects it as a json file to a container
 */
export const devBuildOrderContext = createPipesCore().addModule<PipesNodeModule>(PipesNode);

devBuildOrderContext.config.appName = `Dev Build with Build order Context`;
devBuildOrderContext.config.nodeWorkDir = devWorkDir;
devBuildOrderContext.config.nodeImageKey = devImageKey;

export const devBuildOrderImageKey = `${devImageKey}-with-build-order`;

devBuildOrderContext.addScript(async (context, config) => {
  render(
    <PipesDOM.Table>
      <PipesDOM.TableHeadings>
        <PipesDOM.TableCell>Metric</PipesDOM.TableCell>
        <PipesDOM.TableCell>Value</PipesDOM.TableCell>
        <PipesDOM.TableCell>Change since last month</PipesDOM.TableCell>
      </PipesDOM.TableHeadings>
      <PipesDOM.TableRow>
        <PipesDOM.TableCell>Users</PipesDOM.TableCell>
        <PipesDOM.TableCell>4,500</PipesDOM.TableCell>
        <PipesDOM.TableCell>+15%</PipesDOM.TableCell>
      </PipesDOM.TableRow>
      <PipesDOM.TableRow>
        <PipesDOM.TableCell>Revenue</PipesDOM.TableCell>
        <PipesDOM.TableCell>$12,000</PipesDOM.TableCell>
        <PipesDOM.TableCell>-2%</PipesDOM.TableCell>
      </PipesDOM.TableRow>
      <PipesDOM.TableRow>
        <PipesDOM.TableCell>Subscriptions</PipesDOM.TableCell>
        <PipesDOM.TableCell>2,000</PipesDOM.TableCell>
        <PipesDOM.TableCell>+8%</PipesDOM.TableCell>
      </PipesDOM.TableRow>
    </PipesDOM.Table>,
  );
  try {
    const imageStore = await context.imageStore;

    const container = await imageStore.awaitForAvailability(`node-${config.nodeImageKey}`);
    const currentPath = fileURLToPath(dirname(import.meta.url));
    const scriptFile = join(currentPath, "build-order-runner.ts");
    const buildOrderJSON = join(config.nodeWorkDir, "build-order.json");
    const buildOrderContainer = context.addEnv({
      container,
      env: [["BUILD_ORDER_JSON", buildOrderJSON]],
    });
    const result = await context.nodeCompileAndRun({
      name: "build-order",
      file: scriptFile,
      container: buildOrderContainer,
      external: ["@island-is/scripts"],
      output: { output: "stdout" },
    });

    if (!result.error && result.container) {
      await imageStore.setKey(`node-${devBuildOrderImageKey}`, result.container);
      await testReport.buildOrder.set({
        type: "BuildOrder",
        status: "Success",
      });
      return;
    }
    await testReport.buildOrder.set({
      type: "BuildOrder",
      status: "Error",
      error: result.message,
    });
  } catch (e) {
    await testReport.buildOrder.set({
      type: "BuildOrder",
      status: "Error",
      error: e,
    });
  }
});
