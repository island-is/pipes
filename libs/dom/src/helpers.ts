import type { DialogType, IListItem, ITableCell, ITableHeadings, ITableRow } from "./elements/elements.js";

export const ANSI_RESET = "\u001b[0m";
export const ANSI_BLUE = "\x1b[34m";
export const ANSI_BOLD = "\u001b[1m";
export const ANSI_RED = "\u001b[31m";
export const ANSI_GREEN = "\u001b[32m";
export const ANSI_YELLOW = "\u001b[33m";
export const ANSI_CYAN = "\u001b[36m";
export const ANSI_BLACK = "\u001b[30m";
export const ANSI_BG_WHITE = "\u001b[47m";

export const DIALOG_STYLES: Record<DialogType, string> = {
  default: "\u001b[37m",
  error: ANSI_RED,
  success: ANSI_GREEN,
  failure: ANSI_YELLOW,
};
export type BorderPart = "top" | "middle" | "bottom";

export const isListItem = (e: any): e is IListItem => {
  return typeof e === "object" && e !== null && e.type === "ListItem";
};

export const isTableRow = (e: any): e is ITableRow => {
  return typeof e === "object" && e !== null && e.type === "TableRow";
};

export const isTableCell = (e: any): e is ITableCell => {
  return typeof e === "object" && e !== null && e.type === "TableCell";
};

export const isTableHeadings = (e: any): e is ITableHeadings => {
  return typeof e === "object" && e !== null && e.type === "TableHeadings";
};
