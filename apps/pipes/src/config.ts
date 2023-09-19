import { z } from "@island-is/zod";
import ciinfo from "ci-info";

export const PipesConfig = {
  isDev: z
    .boolean()
    .default(ciinfo.isCI, {
      env: "IS_DEV",
      arg: {
        long: "show-dev-logs",
      },
    })
    .parse(undefined),
};
