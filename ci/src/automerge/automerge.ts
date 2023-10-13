import { createPipesCore, createTask } from "@island.is/pipes-core";
import { PipesGitHub } from "@island.is/pipes-module-github";

import type { PipesGitHubModule } from "@island.is/pipes-module-github";

/**
 * This installs source files to a image and calls yarn install
 */
export const automergeContext = createPipesCore().addModule<PipesGitHubModule>(PipesGitHub);
automergeContext.config.appName = "Auto merge";
automergeContext.addScript(async (context, config) => {
  await createTask(
    async () => {
      context.githubInitPr();
      if (!config.githubCurrentPr) {
        return;
      }
      if (!config.githubCurrentPr.initiator) {
        return;
      }
      const initiator = config.githubCurrentPr.initiator.login;
      if (initiator === "dependabot[bot]") {
        // This is dependabot so we want autoreview
        await context.githubApprovePR({
          body: "Dependabot suggestions are always welcome!",
        });
        // Adn we enable auto merging
        await context.githubEnableAutoMergePR({});
      } else if (initiator === "lodmfjord") {
        // Lodmfjord is lonely and has no friends.
        await context.githubApprovePR({
          body: "I hope you know what you are doing!",
        });
      }
    },
    {
      inProgress: `Automerging if needed`,
      finished: "Automerging finished",
      error: "Failed automerging",
    },
    context,
  );
});
