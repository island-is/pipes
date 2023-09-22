import { createPipe } from "@island-is/pipes-core";

import { GlobalConfig } from "./config.js";
import { workspaceTestContext } from "./constraints/workspace-test.js";
import { devImageInstallContext } from "./install/dev-image.js";
import { releaseContext } from "./release/release.js";

await createPipe(() => {
  const tasks = [devImageInstallContext, workspaceTestContext];
  if (GlobalConfig.action === "Release") {
    return [...tasks, releaseContext];
  }
  if (GlobalConfig.action === "Test") {
    return [...tasks];
  }
  throw new Error("Not defined");
});
