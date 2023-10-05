import { writeFile } from "fs/promises";
import { join } from "path/posix";

import { type removeContextCommand, tmpFile } from "@island-is/pipes-core";

import type { PipesNodeModule } from "../interface.js";

export const modifyPackageJSON: removeContextCommand<PipesNodeModule["Context"]["Implement"]["nodeModifyPackageJSON"]> =
  async function modifyPackageJSON(context, config, props) {
    const container = await context.nodePrepareContainer();
    const packageJSONPath = join(config.nodeWorkDir, props.relativeCwd, "package.json");
    const packageJSON = JSON.parse(await container.file(packageJSONPath).contents());
    const _value = await props.fn(packageJSON);
    const value = JSON.stringify(_value, null, 2);
    await using tmp = await tmpFile({ prefix: "package", postfix: ".json" });
    const tmpFilePath = tmp.path;
    await writeFile(tmpFilePath, value, "utf-8");
    const packageJSONNewFile = context.client.host().file(tmpFilePath);
    const newContainer = container.withFile(packageJSONPath, packageJSONNewFile);
    await (await context.imageStore).setKey(`node-${config.nodeImageKey}`, newContainer);
  };
