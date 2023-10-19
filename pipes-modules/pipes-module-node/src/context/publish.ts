import fsPromises from "node:fs/promises";

import { tmpFile, z } from "@island.is/pipes-core";

import type { PipesNodeModule } from "../pipes-module-node.js";
import type { Container, removeContextCommand } from "@island.is/pipes-core";

export const NodePublishParseInput = z.object({
  token: z.string({ required_error: "Token is required to publish", invalid_type_error: "Token expects a string" }),
  relativeWorkDir: z.string({
    required_error: "Relative dir is required for publish",
    invalid_type_error: "Relative dir expects string for publish",
  }),
  access: z.union([z.literal("public"), z.literal("private")]).default("restricted"),
  container: z.custom<Container>().optional(),
  unpublish: z.union([z.literal("ifExists"), z.literal("always"), z.literal("never")]).default("never"),
});

export type NodePublishInput = z.input<typeof NodePublishParseInput>;
export const NodePublishParseOutput = z.promise(z.void());
export type NodePublishOutput = z.output<typeof NodePublishParseOutput>;
export const NodePublish: removeContextCommand<PipesNodeModule["Context"]["Implement"]["nodePublish"]> = async (
  context,
  _config,
  props,
) => {
  const oldContainer = props.container ?? (await context.nodePrepareContainer());
  const workDir = "/build";
  const workDirNpmrc = `${workDir}/.npmrc`;
  const workDirPackageJSON = `${workDir}/package.json`;
  await using tmp = await tmpFile({ postfix: ".json" });
  const path = tmp.path;

  await fsPromises.writeFile(path, `//registry.npmjs.org/:_authToken=${props.token}`, "utf8");
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
  if (props.unpublish === "always" || props.unpublish === "ifExists") {
    try {
      await fn(["unpublish", `${name}@${version}`, "--registry", "https://registry.npmjs.org"]);
    } catch (e) {
      if (props.unpublish === "always") {
        throw e;
      }
    }
  }

  await fn(["publish", "--access", props.access ?? "restricted", "--registry", "https://registry.npmjs.org"]);

  return;
};
