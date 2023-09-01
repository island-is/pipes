import type { PipesContextCommandBase } from "./pipes-command.js";
export type changeFunctionToPipes<fn extends (...args: any[]) => any> = fn extends (...args: infer P) => infer R ? {
    (...args: P): R;
} & PipesContextCommandBase : never;
