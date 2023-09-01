import { createPipe } from "@islandis/pipes-core";
import { PipesNode } from "@islandis/pipes-module-node";
await createPipe(({ createPipesCore, configHasModule })=>{
    const testContext = createPipesCore().addModule(PipesNode);
    console.log(`Waiting for imaege`);
    testContext.addScript(async (context)=>{
        const image = await (await context.imageStore).awaitForAvailability(`node-${devImageInstallContext.config.nodeImageKey}`);
        console.log(`Image ready`);
    });
    return [
        devImageInstallContext,
        testContext
    ];
});
