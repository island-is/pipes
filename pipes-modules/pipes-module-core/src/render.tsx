import { PipesDOM } from "@island-is/dom";
import { autorun, reaction } from "mobx";

import type { PipeComponents } from "@island-is/dom";

export const render = async (element: () => PipeComponents | Promise<PipeComponents>, now = false): Promise<void> => {
  if (now) {
    await PipesDOM.consoleRender.mountAndRender(await element());
    return;
  }
  const render = await PipesDOM.consoleRender.mountAndRender(<></>);
  let prevValues: string | null = "";
  autorun(async () => {
    const values = await element();
    if (JSON.stringify(values) === prevValues) {
      return;
    }

    prevValues = JSON.stringify(values);
    return render(values);
  });
};
