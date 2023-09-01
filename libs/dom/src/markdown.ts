/* eslint-disable prefer-template */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { writeFile } from "node:fs/promises";

import { isTableHeadings, isTableRow } from "./helpers.js";

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
  IText,
  ITimestamp,
  ITitle,
  IWarning,
} from "./elements/elements.js";

const MarkdownRenderers: { [key: string]: (component: any) => string } = {
  Mask: (_component: IMask) => {
    return "";
  },
  Group: (component: IGroup) => {
    return renderToMarkdownString(component.children);
  },
  Text: (component: IText) => component.value || "",
  Link: (component: ILink) => `[${component.children}](${component.href})`,
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
      return `Invalid Date`;
    }
    const format = component.format || "ISO";
    switch (format) {
      case "STRING":
        return date.toString();
      case "ISO":
        return date.toISOString();
      case "Locale":
      default:
        return date.toLocaleString();
    }
  },
  Container: (component: IContainer) =>
    `\n\n${renderToMarkdownString(Array.isArray(component.children) ? component.children : [component.children])}\n\n`,
  Row: (component: IRow) =>
    renderToMarkdownString(
      "children" in component ? (Array.isArray(component.children) ? component.children : [component.children]) : [],
    ),
  Success: (component: ISuccess) => `\n✅ ${renderToMarkdownString(component.children)}\n`,

  Failure: (component: IFailure) => `\n❌ ${renderToMarkdownString(component.children)}\n`,

  Error: (component: IError) => `\n🔴 ${renderToMarkdownString(component.children)}\n`,

  Info: (component: IInfo) => `\nℹ️ ${renderToMarkdownString(component.children)}\n`,

  Log: (component: ILog) => renderToMarkdownString(component.children),

  Title: (component: ITitle) => `\n# ${renderToMarkdownString(component.children)}\n`,

  Subtitle: (component: ISubtitle) => `\n## ${renderToMarkdownString(component.children)}\n`,

  List: (component: IList) => {
    const value = Array.isArray(component.children)
      ? component.children.map((child) => `- ${renderToMarkdownString(child)}`).join("\n")
      : `- ${renderToMarkdownString(component.children)}`;
    return `\n\n${value}\n\n`;
  },
  ListItem: (component: IListItem) => renderToMarkdownString(component.children),

  Dialog: (component: IDialog) => {
    const msg = component.message
      .split("\n")
      .map((e) => `> ${e} \n`)
      .join("\n");
    return `\n\n${msg}\n\n`;
  },
  Divider: (_component: IDivider) => "\n\n---\n\n",

  Badge: (component: IBadge) => `[${renderToMarkdownString(component.children)}]`,

  Note: (component: INote) => `\n\n> Note: ${renderToMarkdownString(component.children)}\n\n`,

  Warning: (component: IWarning) => `\n\n> Warning: ${renderToMarkdownString(component.children)}\n\n`,

  Highlight: (component: IHighlight) => `**${renderToMarkdownString(component.children)}**`,

  Code: (component: ICode) => `\`${renderToMarkdownString(component.children)}\``,

  Fragment: (component: IFragment) =>
    renderToMarkdownString(Array.isArray(component.children) ? component.children : [component.children]),

  Table: (component: ITable) => {
    // Tables in Markdown are quite specific; here's a basic implementation
    let tableStr = "\n\n";
    if (Array.isArray(component.children)) {
      for (const child of component.children) {
        if (isTableHeadings(child)) {
          const children = Array.isArray(child.children) ? child.children : [child.children];
          tableStr += children.map((cell) => `| ${renderToMarkdownString(cell)} `).join("|") + "|\n";
          tableStr += children.map(() => "|:---:").join("") + "|\n";
        } else if (isTableRow(child)) {
          const children = Array.isArray(child.children) ? child.children : [child.children];
          tableStr += children.map((cell) => `| ${renderToMarkdownString(cell)} `).join("|") + "|\n";
        }
      }
    }
    return tableStr + "\n\n";
  },
  TableCell: (component: ITableCell) => {
    return component.children;
  },
};

export const renderToMarkdownString = (component: JSX.Element | null): string => {
  if (component === null || typeof component === "undefined") {
    return "";
  }
  if (typeof component === "string") {
    return component;
  }
  if (Array.isArray(component)) {
    return component.map((value) => renderToMarkdownString(value)).join(" ");
  }

  if (!component || !("type" in component)) {
    return "";
  }

  if (MarkdownRenderers[component.type as string]) {
    return MarkdownRenderers[component.type as string](component);
  }
  throw new Error("Invalid type");
};

class SummaryRender {
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
  #streamWrite = async (chunk: string, encoding: BufferEncoding = "utf-8") => {
    await this.#lockRender(async () => {
      if (!process.env["GITHUB_STEP_SUMMARY"]) {
        return;
      }
      await writeFile(process.env["GITHUB_STEP_SUMMARY"], chunk, encoding);
    });
  };
  #write = async () => {
    await this.#streamWrite(this.#string);
  };
  get lineCount() {
    if (!this.#string) return 0;

    const lines = this.#string.split("\n");

    const lineCount = lines.length - 1;

    return lineCount;
  }
  mount(element: JSX.Element) {
    this.#elements.push(element);
  }
  async render() {
    let string = "";
    for (const element of this.#elements) {
      string += renderToMarkdownString(element);
    }
    this.#string = string;
    await this.#write();
  }
}
export const summaryRender = new SummaryRender();
