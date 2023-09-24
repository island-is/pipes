import { createZodStore, z } from "../utils/zod/zod.js";

import type { InternalStateStore, LoaderStateStore } from "./types/internal-schema-types.js";

export const internalStateSchema = z
  .union([
    z.literal("running"),
    z.literal("waiting"),
    z.literal("waiting_for_dependency"),
    z.literal("finished"),
    z.literal("failed"),
  ])
  .default("waiting");

export const taskSchema = z.array(z.symbol()).default([]);
export const loaderStateSchema = z
  .union([z.literal("initializing"), z.literal("starting"), z.literal("running"), z.literal("finished")])
  .default("initializing");

export const internalStateStoreSchema = z.object({
  name: z.string().default("Unnamed"),
  state: internalStateSchema,
});
export const stateStoreSchema = {
  symbolsOfTasksCompleted: taskSchema,
  symbolsOfTasksFailed: taskSchema,
  symbolsOfTasks: taskSchema,
  state: loaderStateSchema,
};
export function createInternalState(): InternalStateStore {
  return createZodStore({
    state: internalStateSchema,
    name: z.string().default("Unnamed"),
  });
}

export function createState(): LoaderStateStore {
  return createZodStore({
    symbolsOfTasksCompleted: taskSchema,
    symbolsOfTasksFailed: taskSchema,
    symbolsOfTasks: taskSchema,
    state: loaderStateSchema,
  });
}
