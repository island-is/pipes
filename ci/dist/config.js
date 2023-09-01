import { z } from "@islandis/pipes-core";
import ciInfo from "ci-info";
/** Base config */ export const config = (()=>{
    if (ciInfo.isCI) {
        return {
            sourceDir: z.string().default(undefined, {
                arg: {
                    long: "sourceDirectory"
                },
                env: ciInfo.GITHUB_ACTIONS ? "GITHUB_WORKSPACE" : "UNKNOWN"
            }).parse(undefined)
        };
    }
    return {
        sourceDir: z.string().default(undefined, {
            arg: {
                long: "sourceDirectory"
            },
            env: "PIPES_PROJECT_ROOT"
        }).parse(undefined)
    };
})();
