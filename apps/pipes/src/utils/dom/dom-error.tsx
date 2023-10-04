import React from "react";

import render from "../ink/render.js";

import { PipesObject } from "./dom.js";

import type { ReactElement } from "react";

export class DOMError extends Error {
  #message: ReactElement;
  constructor(pipeComponent: ReactElement) {
    super("Pipes Error");

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DOMError);
    }

    this.name = this.constructor.name;

    this.#message = pipeComponent;
    console.log(this.#message);
    console.log("we got here");
  }
  get = (): ReactElement => {
    return this.#message;
  };
  toString = async (): Promise<string> => {
    const value = await render(this.#message, { renderAsString: true });
    return value.value();
  };
}
