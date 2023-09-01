import { createPipesCore } from "@island.is/pipes-module-core";
import { PipesGitHub, type PipesGitHubModule } from "@island.is/pipes-module-github";

import { testReport } from "./report.js";

/**
 * Context for PR on Dev - outputs info to github or console
 */
export const githubTestContext = createPipesCore().addModule<PipesGitHubModule>(PipesGitHub);
githubTestContext.config.appName = `Github test`;
githubTestContext.addScript(async (context, config) => {
  const report = async (msg: string) => {
    if (!config.isCI || !config.isPR || config.env !== "github") {
      // Default
      console.log(msg);
      return;
    }
    context.githubInitPr();
    await context.githubWriteCommentToCurrentPr({ comment: msg });
  };

  const buildDevImageReport = await testReport.buildDevImage.get();
  if (buildDevImageReport.status === "Error") {
    await report(`❌ Failed creating build images with error: ${buildDevImageReport.error || "Unknown error"}`);
    console.log(buildDevImageReport);
    return context.haltAll();
  }

  const buildOrderReport = await testReport.buildOrder.get();
  if (buildOrderReport.status === "Error") {
    await report(`❌ Failed creating build order: ${buildOrderReport.error || "Unknown error"}`);
    console.log(buildOrderReport);
    return context.haltAll();
  }
  const buildReport = await testReport.build.get();
  const buildValue = buildReport.filter((e) => e.status === "Error").length > 0
      ? "❌ **Build failed** - please view logs"
      : "✅ Build succesful";
  if (buildValue.split("").includes("❌")) {
    await report(buildValue);
    console.log(buildValue);
    console.log(buildReport.filter((e) => e.status === "Error"));
    return context.haltAll();
  }
  const valuesArr = await Promise.all([
    (await testReport.workspaceTest.get()).filter((e) => e.status === "Error"),
    (await testReport.lint.get()).filter((e) => e.status === "Error"),
    (await testReport.test.get()).filter((e) => e.status === "Error"),
  ]);
  const values = [
    buildValue,
    valuesArr[0].length > 0 ? "❌ **Workspace test failed** - please run ```yarn constraints```" : "✅ Workspace test",
    valuesArr[1].length > 0 ? "❌ **Lint failed** - please view logs" : "✅ Lint succesful",
    valuesArr[2].length > 0 ? "❌ **Test failed** - please view logs" : "✅ Test succesful",
  ]
    .map((e) => `* ${e}`)
    .join("\n");
  const hasErrors = values.split("").find((e) => e === "❌");
  if (hasErrors) {
    console.error(valuesArr.flat());
  }
  const finalReport = [hasErrors ? "❌ Test failed\n\n" : "✅ Test succesful\n\n", values].join("\n");
  await report(finalReport);
  if (hasErrors) {
    context.haltAll();
  }
});
