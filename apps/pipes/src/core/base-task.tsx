import { z } from "zod";
import { createZodStore } from "../pipes-core.js";

/**
 * This is for a basic task.
 */
export const createTask = async <Context extends { getDurationInMs: () => number }, Fn extends () => unknown>(
  task: Fn,
  texts: { inProgress: string; finished: (duration: number) => string; error: (duration: number) => string },
  context: Context,
): Promise<Awaited<ReturnType<Fn>>> => {
  const store = createZodStore({
    duration: z.number().default(0),
    state: z
      .union([
        z.literal("In progress"),
        z.literal("Completed"),
        z.object({
          type: z.literal("Error"),
          value: z.any(),
        }),
      ])
      .default("In progress"),
  });
  try {
    const value = await task();
    store.duration = context.getDurationInMs();
    store.state = "Completed";
    return value;
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
