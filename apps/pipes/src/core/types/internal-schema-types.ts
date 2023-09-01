import type { z } from "../../utils/zod/zod.js";
import type { internalStateSchema, loaderStateSchema } from "../internal-schema.js";

export type InternalState = z.infer<typeof internalStateSchema>;
export type LoaderState = z.infer<typeof loaderStateSchema>;
export type TaskSet = symbol[];

export type InternalStateStore = {
  state: InternalState;
  name: string;
};

export type LoaderStateStore = {
  symbolsOfTasksCompleted: TaskSet;
  symbolsOfTasksFailed: TaskSet;
  symbolsOfTasks: TaskSet;
  state: LoaderState;
};
