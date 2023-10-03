import React from "react";

import render from "../ink/render.js";

import { Error as UIError } from "./elements/elements.js";

import type { ReactElement } from "react";

export class DOMError extends Error {
  #message: ReactElement;
  constructor(pipeComponent: ReactElement) {
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
  }
  get = (): ReactElement => {
    return this.#message;
  };
  toString = async (): Promise<string> => {
    const value = await render(this.#message, { renderAsString: true });
    return value.value();
  };
}
