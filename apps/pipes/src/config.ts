import { z } from "@island.is/zod";

export const PipesConfig = {
  isDev: z
    .boolean()
    .default(false, {
      env: "IS_DEV",
      arg: {
        long: "show-dev-logs",
      },
    })
    .parse(undefined),
};
