import fsPromises from "node:fs/promises";

import { ContextHasModule, tmpFile, z } from "@island-is/pipes-core";

import type { PipesGitHubModule } from "../interface-module.js";
import type { Container, removeContextCommand } from "@island-is/pipes-core";
import type { IPipesNodeContext } from "@island-is/pipes-module-node";

export const GithubNodePublishParseInput = z.object({
  token: z.string({ required_error: "Token is required to publish", invalid_type_error: "Token expects a string" }),
  relativeWorkDir: z.string({
    required_error: "Relative dir is required for publish",
    invalid_type_error: "Relative dir expects string for publish",
  }),
  container: z.custom<Container>().optional(),
  unpublish: z.union([z.literal("ifExists"), z.literal("always"), z.literal("never")]).default("never"),
});

export type GithubNodePublishInput = {
  token: string;
  relativeWorkDir: string;
  container?: Container | undefined;
  unpublish?: "ifExists" | "always" | "never" | undefined;
};
export const GithubNodePublishParseOutput = z.custom<Promise<void>>();
export type GithubNodePublishOutput = z.infer<typeof GithubNodePublishParseOutput>;
export const GithubNodePublish: removeContextCommand<
  PipesGitHubModule["Context"]["Implement"]["githubNodePublish"]
> = async (context, _config, props) => {
  if (ContextHasModule<IPipesNodeContext, "nodeRun", typeof context>(context, "nodeRun")) {
    const oldContainer = props.container ?? (await context.nodePrepareContainer());
    const workDir = "/build";
    const workDirNpmrc = `${workDir}/.npmrc`;
    const workDirPackageJSON = `${workDir}/package.json`;
    await using tmp = await tmpFile({ postfix: ".json" });
    const path = tmp.path;

    await fsPromises.writeFile(path, `//npm.pkg.github.com/:_authToken=${props.token}`, "utf8");
    const files = oldContainer.directory(props.relativeWorkDir);
    const container = (await context.nodeGetContainer())
      .withDirectory(workDir, files)
      .withFile(workDirNpmrc, context.client.host().file(path));
    const packageJSON = JSON.parse(await container.file(workDirPackageJSON).contents());
    const fn = async (cmd: string[]) => {
      await container
        .withWorkdir(workDir)
        .withExec(["npm", ...cmd])
        .stdout();
    };
    const name = packageJSON.name as string;
    const version = packageJSON.version as string;
    if (props.unpublish !== "never") {
      try {
        await fn(["unpublish", `${name}@${version}`, "--registry", "https://npm.pkg.github.com"]);
      } catch (e) {
        if (props.unpublish !== "ifExists") {
          throw e;
        }
      }
    }

    await fn(["publish", "--registry", "https://npm.pkg.github.com"]);

    return;
  }
  throw new Error("Node module not set in context");
};
