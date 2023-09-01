import { createGlobalZodKeyStore, z } from "@islandis/zod";
import { generateHashesFromBuild } from "../../scripts/src/lib/generate-hash.js";
import { getAllWorkspaces as getAllWorkspaces } from "../../scripts/src/lib/get-all-workspaces.js";
import { getBuildOrder as _getBuildOrder } from "../../scripts/src/lib/get-build-orders.js";
const globalBuildOrderStore = await createGlobalZodKeyStore(z.custom(), "GLOBAL_BUILD_ORDER");
const BUILD_ORDER = "DEV_BUIL_ORDER";
void getAllWorkspaces().then((workspaces)=>{
    void generateHashesFromBuild(_getBuildOrder(workspaces)).then((value)=>{
        void globalBuildOrderStore.setKey(BUILD_ORDER, value);
    });
});
export const getBuildOrder = ()=>globalBuildOrderStore.awaitForAvailability(BUILD_ORDER);
