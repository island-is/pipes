import { PipesError } from "./pipes-error.js";

export function timeFunction<T extends (..._args: any[]) => any>(
  fn: T,
  name?: string,
): (...args: Parameters<T>) => {
  timeStarted: Date;
  timeEnded: Date;
  duration: number;
  value: ReturnType<T>;
  name?: string | undefined;
} {
  const timeStarted = new Date();
  return (...args: Parameters<T>) => {
    try {
      const value = fn(...args);
      const timeEnded = new Date();
      const duration = timeEnded.getTime() - timeStarted.getTime();

      return {
        timeStarted,
        timeEnded,
        duration,
        value,
        name,
      };
    } catch (error) {
      const timeEnded = new Date();
      const duration = timeEnded.getTime() - timeStarted.getTime();

      throw new PipesError({
        parameters: args,
        duration,
        error,
      });
    }
  };
}
