import React, { Fragment } from "react";

import { PipesDOM } from "../../pipes-core.js";

import Text from "./components/text.js";
import { forceRenderNow_DO_NOT_USE_THIS_OR_YOU_WILL_GET_FIRED } from "./render.js";

const masks = new Set<string | number>();
const getMasks = () => Array.from(masks);
export const maskValue = "****";

export const maskString = (value: string | number): string => {
  let str = `${value}`;
  getMasks().forEach((item) => {
    str = str.replaceAll(`${item}`, maskValue);
  });
  return str;
};

export const setMask = (value: (string | number) | (string | number)[]): void => {
  if (Array.isArray(value)) {
    value.filter(Boolean).forEach((item) => setMask(item));
    return;
  }
  masks.add(value);
};

/** Console.log monkey patch */

(function () {
  function sanitize(input: unknown, padding: number = 0, seen: Set<any> = new Set()) {
    if (typeof input === "string" || typeof input === "number") {
      return <Text>{maskString(input)}</Text>;
    }
    if (typeof input === "boolean") {
      return (
        <Text bold={true} color={input ? "green" : "red"}>
          {input.toString()}
        </Text>
      );
    }
    if (typeof input === "symbol") {
      return <Text bold={true}>Symbol</Text>;
    }
    if (typeof input === "function") {
      return <Text bold={true}>Function</Text>;
    }
    if (typeof input === null) {
      return <Text bold={true}>null</Text>;
    }
    if (typeof input === undefined) {
      return <Text bold={true}>undefined</Text>;
    }
    if (typeof input === "object" && input !== null) {
      if (seen.has(input)) {
        return <Text bold={true}>[[Circular Reference]]</Text>;
      }
      seen.add(input);
      return (
        <Fragment>
          <Text bold={true}>Object{JSON.stringify(input)}</Text>
          {Object.keys(input).map((key, index) => {
            return (
              <Fragment key={index}>
                <Text>
                  {"\n"}
                  {"  ".repeat(padding + 1)}
                  {maskString(key)}:{" "}
                </Text>
                {sanitize(input[key as keyof typeof input], padding + 1, seen)}
              </Fragment>
            );
          })}
        </Fragment>
      );
    }
    return <Text bold={true}>{typeof input}</Text>;
  }
  const render = (Element: JSX.Element) => {
    forceRenderNow_DO_NOT_USE_THIS_OR_YOU_WILL_GET_FIRED(Element);
  };

  console.log = function () {
    const args = Array.prototype.slice.call(arguments).map((input) => sanitize(input));
    render(<PipesDOM.Log>{args}</PipesDOM.Log>);
    // Additional logic or modification here...
  };

  console.error = function () {
    const args = Array.prototype.slice.call(arguments).map((input) => sanitize(input));

    render(<PipesDOM.Error>{args}</PipesDOM.Error>);
  };

  console.info = function () {
    const args = Array.prototype.slice.call(arguments).map((input) => sanitize(input));
    render(<PipesDOM.Info>{args}</PipesDOM.Info>);
  };
  console.trace = function () {
    const args = Array.prototype.slice.call(arguments).map((input) => sanitize(input));
    render(<PipesDOM.Info>{args}</PipesDOM.Info>);
  };
  console.warn = function () {
    const args = Array.prototype.slice.call(arguments).map((input) => sanitize(input));
    render(<PipesDOM.Info>{args}</PipesDOM.Info>);
  };
  console.assert = function () {
    const args = Array.prototype.slice.call(arguments).map((input) => sanitize(input));
    render(<PipesDOM.Info>{args}</PipesDOM.Info>);
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
