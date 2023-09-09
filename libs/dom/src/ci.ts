/* eslint-disable @typescript-eslint/no-use-before-define */
import { EOL } from "node:os";

import ciinfo, { isCI } from "ci-info";
import terminalLink from "terminal-link";

import { getDifferences } from "./compare.js";
import { span } from "./elements/css/span.js";
import { Command } from "./github-command.js";
import { isListItem } from "./helpers.js";

import type {
  IBadge,
  ICode,
  IContainer,
  IDialog,
  IDivider,
  IError,
  IFailure,
  IFragment,
  IGroup,
  IHighlight,
  IInfo,
  ILink,
  IList,
  IListItem,
  ILog,
  IMask,
  INote,
  IRow,
  ISubtitle,
  ISuccess,
  ITable,
  ITableCell,
  ITableHeadings,
  ITableRow,
  IText,
  ITimestamp,
  ITitle,
  IWarning,
  PipeComponents,
} from "./elements/elements.js";

const ComponentRenderersANSI: { [key: string]: (component: any, width: number) => string } = {
  Mask: (component: IMask) => {
    const values = (Array.isArray(component.values) ? component.values : [component.values]).filter(
      (e) => typeof e === "string" && e.length > 1,
    );
    if (ciinfo.GITHUB_ACTIONS) {
      return values.map((e) => new Command("add-mask", {}, e).toString()).join("\n");
    }
    return "";
  },
  Group: (component: IGroup, width: number) => {
    const content = renderToANSIString(component.children, width);
    if (ciinfo.GITHUB_ACTIONS) {
      const startGroup = new Command("group", {}, component.title).toString();
      const endGroup = new Command("endgroup", {}, "").toString();
      return `\n${startGroup}\n${content}\n${endGroup}`;
    }
    return content;
  },
  Text: (component: IText) => {
    return component.value || "";
  },
  Link: (component: ILink) => {
    return terminalLink(component.children, component.href);
  },
  Timestamp: (component: ITimestamp) => {
    let date: Date;
    if (component.time) {
      if (typeof component.time === "string" || typeof component.time === "number") {
        date = new Date(component.time);
      } else {
        date = component.time;
      }
    } else {
      date = new Date();
    }
    if (isNaN(date.getTime())) {
      return span("Invalid date", {
        color: "red",
      })[0];
    }
    const format = component.format || "ISO";

    let formattedDate: string;
    switch (format) {
      case "STRING":
        formattedDate = date.toString();
        break;
      case "ISO":
        formattedDate = date.toISOString();
        break;
      case "Locale":
      default:
        formattedDate = date.toLocaleString();
        break;
    }
    return span(formattedDate, {
      color: "blue",
    }).join("");
  },
  Container: (component: IContainer, width: number) => {
    if (Array.isArray(component.children)) {
      const values = component.children
        .map((child) => {
          const value = renderToANSIString(child as PipeComponents, width);
          return value;
        })
        .join("");
      return values;
    } else {
      return renderToANSIString(component.children as any, width);
    }
  },
  Row: (component: IRow, width: number) => {
    if ("children" in component) {
      if (Array.isArray(component.children)) {
        const widthPerChild = Math.floor(width / component.children.length);
        const css = {
          width: widthPerChild,
          margin: {
            right: 1,
          },
        };
        let children = component.children.map((value) => {
          return span(renderToANSIString(value as any, widthPerChild), css);
        });
        const maxArrLength = children.reduce((a, b) => {
          return Math.max(b.length, a);
        }, 0);
        const fillArr = Array(maxArrLength).fill(" ".repeat(widthPerChild));
        children = children.map((e) => {
          return [...e, ...fillArr].slice(0, maxArrLength);
        });
        let str = "";
        for (let y = 0; y < maxArrLength; y++) {
          for (let z = 0; z < children.length; z++) {
            str += children[z][y];
          }
        }
        return str;
      } else {
        return span(renderToANSIString(component.children as any, width), {
          width: width,
          margin: {
            right: 1,
          },
        }).join("");
      }
    } else {
      return "";
    }
  },
  Success: (component: ISuccess, width: number) => {
    return span(`✅ ${renderToANSIString(component.children as any, width)}`, {
      width,
      color: "green",
      height: 1,
    }).join("");
  },
  Failure: (component: IFailure, width: number) => {
    return span(`❌ ${renderToANSIString(component.children as any, width)}`, {
      width,
      color: "red",
      height: 1,
    }).join("");
  },
  Error: (component: IError, width: number) => {
    return span(`${renderToANSIString(component.children as any, width)}`, {
      width,
      color: "red",
    }).join("");
  },
  Info: (component: IInfo, width: number) => {
    return span(`${renderToANSIString(component.children as any, width)}`, {
      width,
      color: "cyan",
    }).join("");
  },
  Log: (component: ILog, width: number) => {
    return span(`${renderToANSIString(component.children as any, width)}`, {
      width,
    }).join("");
  },
  Title: (component: ITitle, width: number) => {
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
  Subtitle: (component: ISubtitle, width: number) => {
    return span(`${renderToANSIString(component.children as any, width)}`, {
      width,
      fontStyle: "underline",
    }).join("");
  },
  List: (component: IList, width: number) => {
    if (Array.isArray(component.children)) {
      const children = component.children.filter((e): e is IListItem => isListItem(e));
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
  ListItem: (component: IListItem, width: number) => {
    return span(renderToANSIString(component.children as any, width), {
      width,
    }).join("");
  },
  Dialog: (component: IDialog, width: number) => {
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
  Badge: (component: IBadge) => {
    return span(`[${renderToANSIString(component.children as any, 1)}]`, {
      width: 5,
      padding: {
        left: 1,
        right: 1,
      },
    }).join("");
  },
  Divider: (component: IDivider, width: number) => {
    return span(" ", {
      width,
      height: 2,
      border: {
        bottom: true,
        style: "solid",
      },
    }).join("");
  },
  Note: (component: INote, width: number) => {
    return span(`Note: ${renderToANSIString(component.children as any, width)}`, {
      width,
      color: "cyan",
    }).join("");
  },
  Warning: (component: IWarning, width: number) => {
    return span(`WARNING: ${renderToANSIString(component.children as any, width)}`, {
      width,
      color: "yellow",
    }).join("");
  },
  Highlight: (component: IHighlight, width: number) => {
    return span(`${renderToANSIString(component.children as any, width)}`, {
      width,
      color: "black",
      backgroundColor: "white",
    }).join("");
  },
  Fragment: (component: IFragment, width: number) => {
    if (Array.isArray(component.children)) {
      return component.children.map((child) => renderToANSIString(child as any, width)).join("");
    } else {
      return renderToANSIString(component.children, width);
    }
  },
  Code: (component: ICode) => {
    // TODO: Fix this
    return component.children?.toString() ?? "";
  },
  Table: (component: ITable, width: number) => {
    const children = component.children
      ? Array.isArray(component.children)
        ? component.children
        : [component.children]
      : [];
    return children
      .map((e) => renderToANSIString(e as PipeComponents, width))
      .flat()
      .join("");
  },
  TableRow: (component: ITableRow, width: number) => {
    const children = component.children
      ? Array.isArray(component.children)
        ? component.children
        : [component.children]
      : [];
    const count = children.length;
    const childWidth = Math.floor(width / count);
    return children
      .map((e) =>
        span(renderToANSIString(e as PipeComponents, childWidth - 2), {
          width: childWidth,
          padding: {
            left: 1,
            right: 1,
          },
        }),
      )
      .join("");
  },
  TableCell: (component: ITableCell, width: number) => {
    return renderToANSIString(component.children, width);
  },
  TableHeadings: (component: ITableHeadings, width: number) => {
    const children = component.children
      ? Array.isArray(component.children)
        ? component.children
        : [component.children]
      : [];
    const count = children.length;
    const childWidth = Math.floor(width / count);
    return `${children
      .map((e) =>
        span(renderToANSIString(e as PipeComponents, childWidth), {
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

export const renderToANSIString = (component: PipeComponents | null, width: number): string => {
  if (component === null || typeof component === "undefined") {
    return "";
  }
  if (typeof component === "string" || typeof component == "number") {
    return `${component}`;
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
};

class ConsoleRender {
  #PRINT_ONLY_CHANGES = true;
  #TERMINAL_WIDTH = process.stdout.columns || 80;
  #elements: PipeComponents[] = [];
  #renderInProgress = false;
  constructor() {
    process.stdout.on("resize", () => {
      this.#TERMINAL_WIDTH = process.stdout.columns;
    });
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
    return new Promise<void>(async (resolve, reject) => {
      await this.#lockRender(() => {
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
    });
  };

  async #clear() {
    const clearLines = "\x1b[2J\x1b[H";

    await this.#streamWrite(clearLines);
  }

  async mountAndRender(element: PipeComponents) {
    this.#elements.push(element);
    const indexOf = this.#elements.indexOf(element);

    if (this.#PRINT_ONLY_CHANGES) {
      await this.#render(element);
    } else {
      await this.#clear();
      await this.#renderAll();
    }
    const render = async (newElements: PipeComponents) => {
      if (isCI) {
        const prevElements = this.#elements[indexOf];
        const compare = getDifferences(newElements, prevElements);
        this.#elements[indexOf] = newElements;
        console.log(compare);
        await this.#render(compare as any);

        return;
      }
      await this.#clear();
      this.#elements[indexOf] = newElements;
      await this.#renderAll();
    };
    return render;
  }
  async #renderAll() {
    for (const element of this.#elements) {
      await this.#render(element);
    }
  }
  async #render(element: PipeComponents) {
    let string = "";

    string += renderToANSIString(element, this.#TERMINAL_WIDTH);

    string.replace("\n", EOL);
    const lines = string.split("\n");
    for (const line of lines) {
      await this.#streamWrite(`${line}\n`);
    }
  }
}
export const consoleRender = new ConsoleRender();
