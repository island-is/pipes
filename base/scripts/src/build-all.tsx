import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { PipesDOM, Shell, z } from "@island.is/pipes-core";
import React from "react";

const action = z
  .string()
  .default("build", {
    arg: {
      long: "action",
    },
  })
  .parse();
export const build = async (path: string, name: string): Promise<void> => {
  await using _buildRender = await PipesDOM.render(
    <PipesDOM.Info>
      {action} {name}
    </PipesDOM.Info>,
    { forceRenderNow: true },
  );
  const { code, stderr } = await Shell.execute("yarn", [action], {
    cwd: path,
    env: process.env,
  });
  if (code === 0) {
    await PipesDOM.render(
      <PipesDOM.Success>
        Completed {action} for {name}
      </PipesDOM.Success>,
      { forceRenderNow: true },
    );
    return;
  }

  await PipesDOM.render(
    <PipesDOM.Failure>
      {action} failed for {name} with message: {stderr}
    </PipesDOM.Failure>,
    { forceRenderNow: true },
  );
  process.exit(1);
};

const currentPath = join(fileURLToPath(import.meta.url), "..");
const root = join(currentPath, "..", "..", "..");

const getAppPath = (type: "app" | "module", name: string) => {
  if (type === "app") {
    return join(root, "apps", name);
  }
  if (type === "module") {
    return join(root, "pipes-modules", name);
  }
  throw new Error("Invalid type");
};

await build(getAppPath("app", "pipes"), "pipes-core").then(() => {
  return Promise.all([
    build(getAppPath("app", "create-pipes"), "create-pipes"),
    build(getAppPath("module", "pipes-module-node"), "pipes-module-node").then(() => {
      return build(getAppPath("module", "pipes-module-github"), "pipes-module-github");
    }),
  ]);
});
