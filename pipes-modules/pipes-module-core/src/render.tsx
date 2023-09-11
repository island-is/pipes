import { PipesDOM } from "@island-is/dom";
import { autorun } from "mobx";

import type { PipeComponents } from "@island-is/dom";

const _DEBOUNCE_MS = 100;

function debounce(func: Function, timeout: { timeout: NodeJS.Timeout | null }, wait: number) {
  return function (...args: any[]) {
    /** @ts-expect-error - This is any */
    const context = this;
    if (timeout.timeout) {
      clearTimeout(timeout.timeout);
    }
    timeout.timeout = setTimeout(() => {
      func.apply(context, args);
      timeout.timeout = null;
    }, wait);
  };
}

export const render = async (element: () => PipeComponents | Promise<PipeComponents>, now = false): Promise<void> => {
  if (now) {
    await PipesDOM.consoleRender.mountAndRender(await element());
    return;
  }
  const timeoutObj: { timeout: NodeJS.Timeout | null } = { timeout: null };

  const render = await PipesDOM.consoleRender.mountAndRender(<></>);
  let prevValues: string | null = "";
  autorun(
    /** If the state changes occur too rapidly - we want to wait a little bit */
    async () => {
      const values = await element();
      debounce(
        async () => {
          /** If nothing has changed (a state has changed but not output) we just return */
          if (JSON.stringify(values) === prevValues) {
            return;
          }

          prevValues = JSON.stringify(values);
          await render(values);
        },
        timeoutObj,
        _DEBOUNCE_MS,
      )();
    },
  );
};
