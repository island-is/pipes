export class PipesError<T extends (...value: any[]) => any> extends Error {
  #parameters?: Parameters<T>;
  #duration: number;
  #message: string;
  #error: string | undefined;
  constructor({
    parameters,
    duration,
    message = "Unknown error Occured",
    error,
  }: {
    parameters: Parameters<T>;
    message?: string;
    duration: number;
    error?: unknown;
  }) {
    super(message);
    Object.setPrototypeOf(this, PipesError.prototype);

    this.name = this.constructor.name;
    this.#message = message;
    this.#parameters = parameters || [];
    this.#duration = duration;
    this.#error =
      typeof error === "undefined"
        ? undefined
        : error === null
          ? undefined
          : typeof error === "string"
            ? error
            : typeof error === "object" && error instanceof Error
              ? error.toString()
              : typeof error === "object" && "toString" in error
                ? error.toString()
                : undefined;
  }
  getPipesError(): {
    message: string;
    error: string | undefined;
    duration: number;
    parameters: Parameters<T> | undefined;
  } {
    return {
      message: this.#message,
      error: this.#error,
      duration: this.#duration,
      parameters: this.#parameters,
    };
  }
}
