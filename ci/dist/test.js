import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createPipesCore } from "@islandis/pipes-module-core";
import { PipesNode } from "@islandis/pipes-module-node";
import { devImageKey, devWorkDir } from "./dev-image.js";
/** TODO: Fix type generation */ const testContext = createPipesCore().addModule(PipesNode);
testContext.config.appName = `Test runner`;
testContext.config.nodeWorkDir = devWorkDir;
testContext.config.nodeImageKey = devImageKey;
testContext.addScript(async (context)=>{
    const currentPath = fileURLToPath(dirname(import.meta.url));
    const testFile = join(currentPath, "test-runner.ts");
    await context.nodeCompileAndRun({
        file: testFile,
        external: []
    });
});
