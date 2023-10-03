import Ink from "./ink.js";

import type { ReactNode } from "react";

interface Render {
  stop: () => Promise<void>;
  value: () => string;
}

type RenderValue = ReactNode;
type ValueOrPromise<T> = T | Promise<T>;
type FnOrValue<T> = T | (() => T);
type RenderValueParam = FnOrValue<ValueOrPromise<RenderValue>>;

interface RenderProps {
  renderAsString: boolean;
  forceRenderNow: boolean;
}

/**
 * Mount a component and render the output.
 */
const render = async (node: RenderValueParam, props: Partial<RenderProps> = {}): Promise<Render> => {
  const instance: Ink = new Ink(props.renderAsString ?? false);
  await instance.render(node, props.forceRenderNow ?? false);
  return {
    stop: async () => {
      await instance.render(node);
      instance.unmount();
    },
    value: () => instance.prevValues,
  };
};

export * from "../dom/console-patch.js";
export const forceRenderNow_DO_NOT_USE_THIS_OR_YOU_WILL_GET_FIRED = (node: ReactNode): void => {
  const instance = new Ink(false);
  instance._nonAsyncRender(node);
};

export default render;
