import Ink from "./ink.js";

import type { ReactNode } from "react";

interface Render {
  stop: () => void;
  value: () => string;
}

type RenderValue = ReactNode;
type ValueOrPromise<T> = T | Promise<T>;
type FnOrValue<T> = T | (() => T);
type RenderValueParam = FnOrValue<ValueOrPromise<RenderValue>>;

/**
 * Mount a component and render the output.
 */
const render = async (value: RenderValueParam, toString = false): Promise<Render> => {
  const node = await (() => {
    if (typeof value === "function") {
      return value();
    }
    return value;
  })();
  const instance: Ink = new Ink(toString);
  await instance.render(node);
  return {
    stop: () => instance.unmount(),
    value: () => instance.prevValues,
  };
};

export default render;
