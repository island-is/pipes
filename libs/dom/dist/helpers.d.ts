import type { DialogType } from "./elements/elements.js";
export declare const ANSI_RESET = "\u001B[0m";
export declare const ANSI_BLUE = "\u001B[34m";
export declare const ANSI_BOLD = "\u001B[1m";
export declare const ANSI_RED = "\u001B[31m";
export declare const ANSI_GREEN = "\u001B[32m";
export declare const ANSI_YELLOW = "\u001B[33m";
export declare const ANSI_CYAN = "\u001B[36m";
export declare const ANSI_BLACK = "\u001B[30m";
export declare const ANSI_BG_WHITE = "\u001B[47m";
export declare const DIALOG_STYLES: Record<DialogType, string>;
export type BorderPart = "top" | "middle" | "bottom";
export declare const isListItem: (e: any) => e is {
    type: "ListItem";
    style?: import("./elements/css/types.js").CSS | undefined;
    renderAS?: "ansi" | "markdown" | undefined;
    children: string;
};
export declare const isTableRow: (e: any) => e is {
    type: "TableRow";
    style?: import("./elements/css/types.js").CSS | undefined;
    renderAS?: "ansi" | "markdown" | undefined;
    children: import("./elements/jsx.js").AnyElement | import("./elements/jsx.js").AnyElement[];
};
export declare const isTableCell: (e: any) => e is {
    type: "TableCell";
    style?: import("./elements/css/types.js").CSS | undefined;
    renderAS?: "ansi" | "markdown" | undefined;
    children: string;
};
export declare const isTableHeadings: (e: any) => e is {
    type: "TableHeadings";
    style?: import("./elements/css/types.js").CSS | undefined;
    renderAS?: "ansi" | "markdown" | undefined;
    children: import("./elements/jsx.js").AnyElement | import("./elements/jsx.js").AnyElement[];
};
