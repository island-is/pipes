import type { internalStateSchema, loaderStateSchema } from "../internal-schema.js";
import type { z } from "@island-is/zod";

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
