export class PipesError extends Error {
    #parameters;
    #duration;
    #message;
    #error;
    constructor({ parameters, duration, message = "Unknown error Occured", error }){
        super(message);
        Object.setPrototypeOf(this, PipesError.prototype);
        this.name = this.constructor.name;
        this.#message = message;
        this.#parameters = parameters || [];
        this.#duration = duration;
        this.#error = typeof error === "undefined" ? undefined : error === null ? undefined : typeof error === "string" ? error : typeof error === "object" && error instanceof Error ? error.toString() : typeof error === "object" && "toString" in error ? error.toString() : undefined;
    }
    getPipesError() {
        return {
            message: this.#message,
            error: this.#error,
            duration: this.#duration,
            parameters: this.#parameters
        };
    }
}
