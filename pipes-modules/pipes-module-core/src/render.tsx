import { PipesDOM } from "@island-is/dom";
import { reaction } from "mobx";

import type { JSX } from "@island-is/dom";

export const render = <T extends any>(
  fn: () => T,
  element: (props: Awaited<T>) => JSX.Element,
): ReturnType<typeof reaction> => {
  return reaction(fn, async (value: T) => {
    const renderValue = await value;

    return PipesDOM.consoleRender.mountAndRender(element(renderValue));
  });
};
