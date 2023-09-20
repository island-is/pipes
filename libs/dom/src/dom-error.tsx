import { render } from "@island-is/ink";
import React from "react";

import { Error as UIError } from "./elements/elements.js";

import type { ReactNode } from "react";

export class DOMError extends Error {
  #message: ReactNode;
  constructor(pipeComponent: ReactNode) {
    super("Pipes Error"); // Ensure that pipeComponent can be converted to a string

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DOMError);
    }

    this.name = this.constructor.name;

    this.#message = (
      <>
        {pipeComponent}
        <UIError>{this.stack}</UIError>
      </>
    );
    void render(this.#message);
  }
  get = (): ReactNode => {
    return this.#message;
  };
  toString = async (): Promise<string> => {
    const value = await render(this.#message, true);
    return value.value();
  };
}
