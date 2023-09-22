import type { PipesContextCommandBase } from "./pipes-command.js";

export type removeContextCommand<T extends any> = T extends infer X & PipesContextCommandBase ? X : T;
