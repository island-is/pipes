import ciinfo from "ci-info";

import { z } from "./utils/zod/zod.js";

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
