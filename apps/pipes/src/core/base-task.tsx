import React from "react";

import * as PipesDOM from "../utils/dom/dom.js";
import { createZodStore } from "../utils/zod/observer.js";
import { z } from "../utils/zod/zod.js";

/**
 * This is for a basic task.
 */
export const createTask = async <Context extends { getDurationInMs: () => number }, Fn extends () => any>(
  task: Fn,
  texts: { inProgress: string; finished: string; error: string },
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
  void PipesDOM.render(() => (
    <PipesDOM.Group title={texts.inProgress}>
      {((state, duration) => {
        if (typeof state === "object" && state.type === "Error") {
          return (
            <>
              <PipesDOM.Failure>
                {texts.error} <PipesDOM.Timestamp time={duration} format={"mm:ss.SSS"} />
              </PipesDOM.Failure>
              <PipesDOM.Error>{JSON.stringify(state.value)}</PipesDOM.Error>
            </>
          );
        }
        if (state === "Completed") {
          return (
            <PipesDOM.Success>
              <PipesDOM.Text>{texts.finished}</PipesDOM.Text>
              <PipesDOM.Timestamp time={duration} format={"mm:ss.SSS"} />
            </PipesDOM.Success>
          );
        }
        return <PipesDOM.Info>{texts.inProgress}…</PipesDOM.Info>;
      })(store.state, store.duration)}
    </PipesDOM.Group>
  ));
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
    throw error;
  }
};
