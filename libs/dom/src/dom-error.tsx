import { renderToANSIString } from "./ci.js";
import { PipesDOM } from "./dom.js";

import type { PipeComponents } from "./factory.js";

export class DOMError extends Error {
  #message: PipeComponents;
  constructor(pipeComponent: PipeComponents) {
    super("Pipes Error"); // Ensure that pipeComponent can be converted to a string

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DOMError);
    }

    this.name = this.constructor.name;

    this.#message = (
      <>
        {pipeComponent}
        <PipesDOM.Error>{this.stack}</PipesDOM.Error>
      </>
    );
  }
  get = (): PipeComponents => {
    return this.#message;
  };
  toString = (): string => {
    return renderToANSIString(this.#message, process.stdout.columns || 80);
  };
}
