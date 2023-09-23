import { createPipe } from "@island-is/pipes-core";

import { buildCoreContext } from "./build/build.js";
import { GlobalConfig } from "./config.js";
import { workspaceTestContext } from "./constraints/workspace-test.js";
import { devImageInstallContext } from "./install/dev-image.js";

await createPipe(() => {
  const tasks = [devImageInstallContext, workspaceTestContext, buildCoreContext];
  if (GlobalConfig.action === "Release") {
    return [...tasks];
  }
  if (GlobalConfig.action === "Test") {
    return [...tasks];
  }
  throw new Error("Not defined");
});
