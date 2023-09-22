export * from "./base-class.js";
export * from "./pipes-core-module.js";
export * from "./create-module.js";
export type { AnyModule } from "./types/module.js";
export * from "./pipes-error.js";
export * from "./time-function.js";
export * from "./types/value-to-zod.js";
export * from "./types/simplify.js";

/**
 * This is for a basic task.
 */
export const createTask = async <Context extends Record<string, unknown>, Config extends Record<string, unknown>>(
  task: () => Promise<void> | void,
  texts: { inProgress: string; finished: (duration: number) => string; error: (duration: number) => string },
  context: Context,
  config: Config,
) => {
  const store = createZodStore({
    duration: z.number().default(0),
    state: z
      .union([
        z.literal("Installing"),
        z.literal("Installed"),
        z.object({
          type: z.literal("Error"),
          value: z.any(),
        }),
      ])
      .default("Installing"),
  });
  try {
    await task();
    store.duration = context.getDurationInMs();
    store.state = "Completed";
    successCallback && successCallback();
  } catch (error) {
    store.duration = context.getDurationInMs();
    store.state = {
      type: "Error",
      value: error,
    };
    errorCallback && errorCallback(error);
    throw error;
  }
};
