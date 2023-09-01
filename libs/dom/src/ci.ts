/* eslint-disable @typescript-eslint/no-use-before-define */
import { EOL } from "node:os";

import ciinfo from "ci-info";
import terminalLink from "terminal-link";

import { Command } from "./github-command.js";
import {
  ANSI_BG_WHITE,
  ANSI_BLACK,
  ANSI_BLUE,
  ANSI_BOLD,
  ANSI_CYAN,
  ANSI_GREEN,
  ANSI_RED,
  ANSI_RESET,
  ANSI_YELLOW,
  DIALOG_STYLES,
  isListItem,
  isTableCell,
  isTableHeadings,
  isTableRow,
} from "./helpers.js";

import type {
  DialogProps,
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
} from "./elements/elements.js";
import type { BorderPart } from "./helpers.js";

const renderBorder = (width: number, part: BorderPart): string => {
  const paddedWidth = width + 4; // Additional 2 spaces for each side
  switch (part) {
    case "top":
      return `┌${"─".repeat(paddedWidth)}┐`;
    case "middle":
      return `│${" ".repeat(paddedWidth)}│`;
    case "bottom":
      return `└${"─".repeat(paddedWidth)}┘`;
    default:
      return "";
  }
};

const ComponentRenderersANSI: { [key: string]: (component: any) => string } = {
  Mask: (component: IMask) => {
    const values = (Array.isArray(component.values) ? component.values : [component.values]).filter(
      (e) => typeof e === "string" && e.length > 1,
    );
    if (ciinfo.GITHUB_ACTIONS) {
      return values.map((e) => new Command("add-mask", {}, e).toString()).join("\n");
    }
    return "";
  },
  Group: (component: IGroup) => {
    const content = renderToANSIString(component.children);
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
      return `${ANSI_RED}Invalid Date${ANSI_RESET}`;
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
    return `${ANSI_BLUE}${formattedDate}${ANSI_RESET}`;
  },
  Container: (component: IContainer) => {
    if (Array.isArray(component.children)) {
      return `\n${component.children.map((child) => renderToANSIString(child as any)).join("\n")}`;
    } else {
      return `\n${renderToANSIString(component.children as any)}`;
    }
  },

  Row: (component: IRow) => {
    if ("children" in component) {
      if (Array.isArray(component.children)) {
        return `${component.children.map((child) => renderToANSIString(child as any)).join("  ")}`;
      } else {
        return `\n${renderToANSIString(component.children as any)}`;
      }
    } else {
      return "";
    }
  },

  Success: (component: ISuccess) => {
    return `\n✅ ${ANSI_GREEN}${renderToANSIString(component.children as any)}${ANSI_RESET}\n`;
  },

  Failure: (component: IFailure) => {
    return `\n❌ ${ANSI_RED}${renderToANSIString(component.children as any)}${ANSI_RESET}\n`;
  },

  Error: (component: IError) => {
    return `${ANSI_RED}${renderToANSIString(component.children as any)}${ANSI_RESET}`;
  },

  Info: (component: IInfo) => {
    return `${ANSI_CYAN}${renderToANSIString(component.children as any)}${ANSI_RESET}`;
  },

  Log: (component: ILog) => {
    return renderToANSIString(component.children as any);
  },

  Title: (component: ITitle) => {
    return `${ANSI_BOLD}${renderToANSIString(component.children as any)}${ANSI_RESET}\n`;
  },
  Subtitle: (component: ISubtitle) => {
    return renderToANSIString(component.children as any);
  },

  List: (component: IList) => {
    if (Array.isArray(component.children)) {
      const children = component.children.filter((e): e is IListItem => isListItem(e));
      return children.map((child) => `- ${renderToANSIString(child)}`).join("\n");
    } else {
      if (isListItem(component.children)) {
        return `- ${renderToANSIString(component.children)}`;
      }
    }
    return "";
  },

  ListItem: (component: IListItem) => {
    return renderToANSIString(component.children as any);
  },

  Dialog: (component: IDialog) => {
    return Dialog(component);
  },

  Divider: (_component: IDivider) => {
    return "\n-----------------------------------\n";
  },

  Badge: (component: IBadge) => {
    return `[${renderToANSIString(component.children as any)}]`;
  },

  Note: (component: INote) => {
    const value = `${ANSI_CYAN}Note: ${renderToANSIString(component.children as any)}${ANSI_RESET}`;

    return value;
  },

  Warning: (component: IWarning) => {
    return `${ANSI_YELLOW}Warning: ${renderToANSIString(component.children as any)}${ANSI_RESET}`;
  },
  Highlight: (component: IHighlight) => {
    return `${ANSI_BG_WHITE}${ANSI_BLACK}${renderToANSIString(component.children as any)}${ANSI_RESET}`;
  },

  Code: (component: ICode) => {
    return renderToANSIString(component.children as any);
  },

  Fragment: (component: IFragment) => {
    if (Array.isArray(component.children)) {
      return component.children.map((child) => renderToANSIString(child as any)).join("\n");
    } else {
      return renderToANSIString(component.children);
    }
  },
  Table: (component: ITable) => {
    const TERMINAL_WIDTH = process.stdout.columns || 80;

    const components = [...(Array.isArray(component.children) ? component.children : [component.children])].filter(
      (e): e is ITableHeadings | ITableRow => {
        return isTableHeadings(e) || isTableRow(e);
      },
    );

    const maxColumns = components.reduce((max, row) => {
      if (Array.isArray(row.children)) {
        return Math.max(max, row.children.length);
      }
      return max;
    }, 1);

    const maxColumnWidth = Math.floor(TERMINAL_WIDTH / maxColumns);
    return components
      .map((row) => {
        const children = Array.isArray(row.children) ? row.children : [row.children];
        const value = children
          .map((cell) => {
            if (!isTableCell(cell)) {
              return "";
            }
            const cellContent = renderToANSIString(cell) || "";
            const truncatedContent =
              cellContent.length > maxColumnWidth ? `${cellContent.substring(0, maxColumnWidth - 2)}…` : cellContent;

            return truncatedContent.padEnd(maxColumnWidth, " ");
          })
          .join("");
        if (row.type === "TableHeadings") {
          return `${ANSI_BOLD}${value}${ANSI_RESET}`;
        }

        return value;
      })
      .join("\n");
  },

  TableHeadings: (_component: ITableHeadings) => {
    throw new Error("Should be never called directly");
  },

  TableRow: (_component: ITableRow) => {
    throw new Error("Should be never called directly");
  },

  TableCell: (component: ITableCell) => {
    return renderToANSIString(component.children as any);
  },
  // Continue for other component types...
};

export const renderToANSIString = (component: JSX.Element | null): string => {
  if (component === null || typeof component === "undefined") {
    return "";
  }
  if (typeof component === "string") {
    return component;
  }
  if (Array.isArray(component)) {
    return component.map((value) => renderToANSIString(value)).join(" ");
  }

  if (!component || !("type" in component)) {
    return "";
  }

  if (ComponentRenderersANSI[component.type as string]) {
    return ComponentRenderersANSI[component.type as string](component);
  }
  throw new Error("Invalid type");
};

const Dialog = ({ dialogType = "default", message, paddingTop = 0, paddingBottom = 0 }: DialogProps) => {
  const style = DIALOG_STYLES[dialogType];

  const messageLines = (message || "").split("\n");
  const messageWidth = Math.max(...messageLines.map((line) => line.length));

  const topBorder = renderBorder(messageWidth, "top");
  const bottomBorder = renderBorder(messageWidth, "bottom");

  const formattedMessageLines = messageLines
    .map(
      (line) => `│  ${line.padEnd(messageWidth, " ")}  │`, // Additional 2 spaces for each side
    )
    .join("\n");

  const components = [style, topBorder, formattedMessageLines, bottomBorder, ANSI_RESET];

  const formattedMessage = "\n".repeat(paddingTop) + components.join("\n") + "\n".repeat(paddingBottom);

  return formattedMessage.trim(); // This trims whitespace from the start and end of the string
};

export const renderToTerminal = (component: JSX.Element) => {
  process.stdout.write(renderToANSIString(component));
};

class ConsoleRender {
  #string = "";
  #TERMINAL_WIDTH = process.stdout.columns || 80;
  #clearStr = "\r\x1B[1B";
  #elements: JSX.Element[] = [];
  #renderInProgress = false;
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
  #write = async () => {
    const lines = this.#string.split("\n");
    for (const line of lines) {
      await this.#streamWrite(`${line}\n`);
    }
  };
  get lineCount() {
    if (!this.#string) return 0;

    const lines = this.#string.split("\n");

    const lineCount = lines.length - 1;

    return lineCount;
  }
  async #clear() {
    let clearLines = "\x1B[K";
    clearLines += "\x1B[1A\x1B[K".repeat(this.lineCount);
    await this.#streamWrite(clearLines);
  }
  mount(element: JSX.Element) {
    this.#elements.push(element);
  }
  async mountAndRender(element: JSX.Element) {
    this.#elements.splice(0, this.#elements.length);
    this.#elements.push(element);
    await this.render();
  }
  async render() {
    let string = "";
    for (const element of this.#elements) {
      string += renderToANSIString(element);
    }
    this.#string = string.replace("\n", EOL);
    await this.#write();
  }
}
export const consoleRender = new ConsoleRender();
