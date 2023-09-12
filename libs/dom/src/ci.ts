/* eslint-disable @typescript-eslint/no-use-before-define */
import ciinfo from "ci-info";
import stripAnsi from "strip-ansi";

import { getDifferences } from "./compare.js";
import { renderContainer } from "./elements/container.js";
import { span } from "./elements/css/span.js";
import { renderBadge } from "./elements/elements.js";
import { renderError } from "./elements/error.js";
import { renderFailure } from "./elements/failure.js";
import { renderGroup } from "./elements/group.js";
import { renderLink } from "./elements/link.js";
import { renderMask } from "./elements/mask.js";
import { renderRow } from "./elements/row.js";
import { renderSuccess } from "./elements/success.js";
import { renderText } from "./elements/text.js";
import { renderTimestamp } from "./elements/timestamp.js";
import { isListItem } from "./helpers.js";

import type * as elementsJs from "./elements/elements.js";

const ComponentRenderersANSI: { [key: string]: (component: any, width: number) => string } = {
  Mask: renderMask.ansi,
  Group: renderGroup.ansi(renderToANSIString),
  Text: renderText.ansi(renderToANSIString),
  Link: renderLink.ansi(renderToANSIString),
  Timestamp: renderTimestamp.ansi(renderToANSIString),
  Container: renderContainer.ansi(renderToANSIString),
  Row: renderRow.ansi(renderToANSIString),
  Success: renderSuccess.ansi(renderToANSIString),
  Failure: renderFailure.ansi(renderToANSIString),
  Error: renderError.ansi(renderToANSIString),
  Info: (component: elementsJs.IInfo, width: number) => {
    return span(`${renderToANSIString(component.children as any, width)}`, {
      width,
      color: "cyan",
    }).join("");
  },
  Log: (component: elementsJs.ILog, width: number) => {
    return span(`${renderToANSIString(component.children as any, width)}`, {
      width,
    }).join("");
  },
  Title: (component: elementsJs.ITitle, width: number) => {
    return span(`${renderToANSIString(component.children as any, width)}`, {
      width,
      textAlign: "center",
      margin: {
        bottom: 0,
      },

      padding: {
        top: 2,
        bottom: 1,
      },
      fontStyle: "bold",
      border: {
        bottom: true,
      },
    }).join("");
  },
  Subtitle: (component: elementsJs.ISubtitle, width: number) => {
    return span(`${renderToANSIString(component.children as any, width)}`, {
      width,
      fontStyle: "underline",
    }).join("");
  },
  List: (component: elementsJs.IList, width: number) => {
    if (Array.isArray(component.children)) {
      const children = component.children.filter((e): e is elementsJs.IListItem => isListItem(e));
      return children
        .map((child) =>
          span(`- ${renderToANSIString(child, width)}`, {
            width,
            margin: {
              left: 2,
            },
          }),
        )
        .join("\n");
    } else {
      if (isListItem(component.children)) {
        return span(`- ${renderToANSIString(component.children, width - 2)}`, {
          width,
          margin: {
            left: 2,
          },
        }).join("");
      }
    }
    return "";
  },
  ListItem: (component: elementsJs.IListItem, width: number) => {
    return span(renderToANSIString(component.children as any, width), {
      width,
    }).join("");
  },
  Dialog: (component: elementsJs.IDialog, width: number) => {
    const color =
      component.dialogType === "error"
        ? ("white" as const)
        : component.dialogType === "failure"
        ? ("white" as const)
        : component.dialogType === "success"
        ? ("white" as const)
        : ("white" as const);
    const backgroundColor =
      component.dialogType === "error"
        ? ("red" as const)
        : component.dialogType === "failure"
        ? ("red" as const)
        : component.dialogType === "success"
        ? ("green" as const)
        : ("black" as const);
    return span(component.message, {
      width,
      color,
      backgroundColor,
      border: {
        top: true,
        bottom: true,
        left: true,
        right: true,
        style: "solid",
      },

      padding: {
        left: 2,
        top: component.paddingTop,
        bottom: component.paddingBottom,
      },
    }).join("");
  },
  Badge: renderBadge.ansi(renderToANSIString),
  Divider: (component: elementsJs.IDivider, width: number) => {
    return span(" ", {
      width,
      height: 2,
      border: {
        bottom: true,
        style: "solid",
      },
    }).join("");
  },
  Note: (component: elementsJs.INote, width: number) => {
    return span(`Note: ${renderToANSIString(component.children as any, width)}`, {
      width,
      color: "cyan",
    }).join("");
  },
  Warning: (component: elementsJs.IWarning, width: number) => {
    return span(`WARNING: ${renderToANSIString(component.children as any, width)}`, {
      width,
      color: "yellow",
    }).join("");
  },
  Highlight: (component: elementsJs.IHighlight, width: number) => {
    return span(`${renderToANSIString(component.children as any, width)}`, {
      width,
      color: "black",
      backgroundColor: "white",
    }).join("");
  },
  Fragment: (component: elementsJs.IFragment, width: number) => {
    if (Array.isArray(component.children)) {
      return component.children.map((child) => renderToANSIString(child as any, width)).join("");
    } else {
      return renderToANSIString(component.children, width);
    }
  },
  Code: (component: elementsJs.ICode) => {
    // TODO: Fix this
    return component.children?.toString() ?? "";
  },
  Table: (component: elementsJs.ITable, width: number) => {
    const children = component.children
      ? Array.isArray(component.children)
        ? component.children
        : [component.children]
      : [];
    return children
      .map((e) => renderToANSIString(e as elementsJs.PipeComponents, width))
      .flat()
      .join("");
  },
  TableRow: (component: elementsJs.ITableRow, width: number) => {
    const children = component.children
      ? Array.isArray(component.children)
        ? component.children
        : [component.children]
      : [];
    const count = children.length;
    const childWidth = Math.floor(width / count);
    return children
      .map((e) =>
        span(renderToANSIString(e as elementsJs.PipeComponents, childWidth - 2), {
          width: childWidth,
          padding: {
            left: 1,
            right: 1,
          },
        }),
      )
      .join("");
  },
  TableCell: (component: elementsJs.ITableCell, width: number) => {
    return renderToANSIString(component.children, width);
  },
  TableHeadings: (component: elementsJs.ITableHeadings, width: number) => {
    const children = component.children
      ? Array.isArray(component.children)
        ? component.children
        : [component.children]
      : [];
    const count = children.length;
    const childWidth = Math.floor(width / count);
    return `${children
      .map((e) =>
        span(renderToANSIString(e as elementsJs.PipeComponents, childWidth), {
          width: childWidth,
          fontStyle: "bold",
          padding: {
            left: 0,
            right: 0,
          },
        }),
      )
      .join("")}`;
  },
};

export function renderToANSIString(component: elementsJs.PipeComponents | null, width: number): string {
  if (component === null || typeof component === "undefined") {
    return "";
  }
  if (typeof component === "string" || typeof component == "number") {
    return `${component}`.trimStart();
  }
  if (Array.isArray(component)) {
    return component
      .flat(10)
      .map((value) => renderToANSIString(value, width))
      .join(" ");
  }

  if (!component || !("type" in component)) {
    return "";
  }

  if (ComponentRenderersANSI[component.type as string]) {
    return ComponentRenderersANSI[component.type as string](component, width);
  }
  throw new Error("Invalid type");
}

class ConsoleRender {
  #PRINT_ONLY_CHANGES = false;
  #TERMINAL_WIDTH: number;
  #elements: elementsJs.PipeComponents[] = [];
  #renderInProgress = false;
  constructor() {
    if (ciinfo.isCI || typeof process.stdout.columns == "undefined") {
      this.#TERMINAL_WIDTH = 120;
    } else {
      this.#TERMINAL_WIDTH = 60;
      process.stdout.on("resize", () => {
        this.#TERMINAL_WIDTH = process.stdout.columns;
      });
    }
  }
  #lockRender = async (fn: () => void | Promise<void>) => {
    await this.#waitForRenderLock();
    this.#renderInProgress = true;
    await fn();
    this.#renderInProgress = false;
  };
  #waitForRenderLock = () => {
    return new Promise<void>((resolve) => {
      const fn = () => {
        if (!this.#renderInProgress) {
          resolve();
          return;
        }
        setTimeout(fn, 50);
      };
      fn();
    });
  };
  #streamWrite = (chunk: string, stream = process.stdout, encoding: BufferEncoding = "utf-8") => {
    return new Promise<void>((resolve, reject) => {
      const errListener = (err: any) => {
        stream.removeListener("error", errListener);
        reject(err);
      };
      stream.addListener("error", errListener);
      const callback = () => {
        stream.removeListener("error", errListener);
        resolve();
      };
      stream.write(chunk, encoding, callback);
    });
  };

  async mountAndRender(element: elementsJs.PipeComponents) {
    this.#elements.push(element);
    const indexOf = this.#elements.indexOf(element);

    if (this.#PRINT_ONLY_CHANGES) {
      await this.#render(element);
    } else {
      await this.#render(element);
    }
    const render = async (newElements: elementsJs.PipeComponents) => {
      if (this.#PRINT_ONLY_CHANGES) {
        const prevElements = this.#elements[indexOf];
        const compare = getDifferences(newElements, prevElements);
        this.#elements[indexOf] = newElements;
        await this.#render(compare as any);

        return;
      }
      this.#elements[indexOf] = newElements;
      await this.#render(newElements);
    };
    return render;
  }
  #splitByNewlineOrLength(inputString: string) {
    const initialLines = inputString.split("\n");
    const resultLines = [];

    for (let line of initialLines) {
      while (stripAnsi(line).length > 0) {
        let counter = 0;
        let idx = 0;
        let inEscapeSequence = false;

        while (idx < line.length && counter < this.#TERMINAL_WIDTH) {
          if (line[idx] === "\x1b") {
            inEscapeSequence = true;
          }

          if (!inEscapeSequence) {
            counter++;
          }

          idx++;

          if (inEscapeSequence && line[idx] === "m") {
            inEscapeSequence = false;
            idx++;
          }
        }

        resultLines.push(line.slice(0, idx));
        line = line.slice(idx);
      }
    }

    return resultLines;
  }
  async #render(element: elementsJs.PipeComponents) {
    let string = "";

    string += renderToANSIString(element, this.#TERMINAL_WIDTH);

    const lines = this.#splitByNewlineOrLength(string);
    await this.#lockRender(async () => {
      for (const line of lines) {
        await this.#streamWrite(`${line}\n`);
      }
    });
  }
}
export const consoleRender = new ConsoleRender();
