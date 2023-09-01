import { PipesError } from "./pipes-error.js";
export function timeFunction(fn, name) {
    const timeStarted = new Date();
    return (...args)=>{
        try {
            const value = fn(...args);
            const timeEnded = new Date();
            const duration = timeEnded.getTime() - timeStarted.getTime();
            return {
                timeStarted,
                timeEnded,
                duration,
                value,
                name
            };
        } catch (error) {
            const timeEnded = new Date();
            const duration = timeEnded.getTime() - timeStarted.getTime();
            throw new PipesError({
                parameters: args,
                duration,
                error
            });
        }
    };
}
