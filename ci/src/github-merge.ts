import { createPipesCore } from "@island.is/pipes-module-core";
import { PipesGitHub, type PipesGitHubModule } from "@island.is/pipes-module-github";

/**
 * Merge to devel
 */
export const githubMerge = createPipesCore().addModule<PipesGitHubModule>(PipesGitHub);
githubMerge.config.appName = `Github merge`;
githubMerge.addScript(async (context, config) => {
  const report = async (msg: string) => {
    if (!config.isCI || !config.isPR || config.env !== "github") {
      // Default
      console.log(msg);
      return;
    }

    await context.githubWriteCommentToCurrentPr({ comment: msg });
  };
  if (!config.isCI || !config.isPR || config.env !== "github") {
    await report("This currently only runs in CI");
    return context.haltAll();
  }
  context.githubInitPr();
  if (!(await context.gitub))
    if (!(await context.githubAllChecksPassedCurrentPR())) {
      await report(`All tests need to have passed for automerge to act!`);
      return context.haltAll();
    }
  try {
    await context.githubMergeCurrentPR();
    await report("Automerge sucessful, this branch will now be deleted.");
    await context.githubDeleteCurrentMergedBranch();
  } catch (e) {
    await report("Automerge failed :(");
  }
});
