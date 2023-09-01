import Ink from "./ink.js";

import type { ReactNode } from "react";

interface Render {
  stop: () => Promise<void>;
  value: () => string;
  [Symbol.asyncDispose]: () => Promise<void>;
}

type RenderValue = ReactNode;
type ValueOrPromise<T> = T | Promise<T>;
type FnOrValue<T> = T | (() => T);
type RenderValueParam = FnOrValue<ValueOrPromise<RenderValue>>;

interface RenderProps {
  renderAsString: boolean;
  forceRenderNow: boolean;
}

const options = {
  allowOutput: true,
};

export const disableOutput = (): void => {
  options.allowOutput = false;
};

/**
 * Mount a component and render the output.
 */
const render = async (node: RenderValueParam, props: Partial<RenderProps> = {}): Promise<Render> => {
  if (!options.allowOutput) {
    return {
      stop: () => {
        return Promise.resolve();
      },
      [Symbol.asyncDispose]: () => {
        return Promise.resolve();
      },
      value: () => "",
    };
  }
  const instance: Ink = new Ink(props.renderAsString ?? false);
  await instance.render(node, props.forceRenderNow ?? false);
  return {
    stop: async () => {
      await instance.render(node);
      instance.unmount();
    },
    [Symbol.asyncDispose]: async () => {
      await instance.render(node);
      instance.unmount();
    },
    value: () => instance.prevValues,
  };
};

export const forceRenderNow_DO_NOT_USE_THIS_OR_YOU_WILL_GET_FIRED = (node: ReactNode): void => {
  const instance = new Ink(false);
  instance._nonAsyncRender(node);
  instance.unmount();
};

export default render;
