import React from "react";

import { maskString } from "../ink/mask.js";
import { forceRenderNow_DO_NOT_USE_THIS_OR_YOU_WILL_GET_FIRED } from "../ink/render.js";

import { Error as PipesError } from "./elements/error.js";
import { Info } from "./elements/info.js";
import { Log } from "./elements/log.js";
import { PipesObject } from "./elements/object.js";

/** Console.log monkey patch */

const SHOULD_PATCH = false;
(function () {
  if (!SHOULD_PATCH) {
    return;
  }
  const sanitize = (input: unknown) => {
    return <PipesObject value={input} />;
  };
  const render = (Element: JSX.Element) => {
    forceRenderNow_DO_NOT_USE_THIS_OR_YOU_WILL_GET_FIRED(Element);
  };

  console.log = function () {
    const args = Array.prototype.slice.call(arguments).map((input) => sanitize(input));
    render(<Log>{args}</Log>);
  };

  console.error = function () {
    const args = Array.prototype.slice.call(arguments).map((input) => sanitize(input));

    render(<PipesError>{args}</PipesError>);
  };

  console.info = function () {
    const args = Array.prototype.slice.call(arguments).map((input) => sanitize(input));
    render(<Info>{args}</Info>);
  };
  console.trace = function () {
    const args = Array.prototype.slice.call(arguments).map((input) => sanitize(input));
    render(<Info>{args}</Info>);
  };
  console.warn = function () {
    const args = Array.prototype.slice.call(arguments).map((input) => sanitize(input));
    render(<PipesError>{args}</PipesError>);
  };
  console.assert = function () {
    const args = Array.prototype.slice.call(arguments).map((input) => sanitize(input));
    render(<PipesError>{args}</PipesError>);
  };
})();

(function () {
  const OriginalError: ErrorConstructor = Error;

  class PipesError extends OriginalError {
    #name: string;
    constructor(message?: string | undefined, options?: { cause?: unknown }) {
      super(message, options);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, PipesError);
      }

      this.#name = "Error";
    }
    toString() {
      const message = super.toString();
      return maskString(message);
    }
  }

  (Error as any) = PipesError;
})();
