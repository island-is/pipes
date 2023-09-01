/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import * as elements from "./elements/elements.js";
export declare const PipesDOM: {
    renderToANSIString: (component: JSX.Element | null) => string;
    renderToTerminal: (component: JSX.Element) => void;
    consoleRender: {
        "__#103552@#string": string;
        "__#103552@#TERMINAL_WIDTH": number;
        "__#103552@#clearStr": string;
        "__#103552@#elements": JSX.Element[];
        "__#103552@#renderInProgress": boolean;
        "__#103552@#lockRender": (fn: () => void | Promise<void>) => Promise<void>;
        "__#103552@#waitForRenderLock": () => Promise<void>;
        "__#103552@#streamWrite": (chunk: string, stream?: NodeJS.WriteStream & {
            fd: 1;
        }, encoding?: BufferEncoding) => Promise<void>;
        "__#103552@#write": () => Promise<void>;
        readonly lineCount: number;
        "__#103552@#clear"(): Promise<void>;
        mount(element: JSX.Element): void;
        mountAndRender(element: JSX.Element): Promise<void>;
        render(): Promise<void>;
    };
    PipesJSXFactory(type: string | elements.PipeComponents, props?: any, ...children: any): JSX.Element;
    Badge: (props: Omit<{
        type: "Badge";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type">, children: string) => {
        type: "Badge";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
    Code: (props: Omit<{
        type: "Code";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        language?: string | undefined;
        children: elements.AnyElement;
    }, "type">) => {
        type: "Code";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        language?: string | undefined;
        children: elements.AnyElement;
    };
    Container: (props: Omit<{
        type: "Container";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string | elements.JSX | elements.JSX[] | null;
    }, "type" | "children">, children: string | elements.JSX | elements.JSX[] | null) => {
        type: "Container";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string | elements.JSX | elements.JSX[] | null;
    };
    Dialog: (props: Omit<elements.IDialog, "type">) => elements.IDialog;
    Divider: (props: Omit<elements.IDivider, "type">) => elements.IDivider;
    Error: (props: Omit<{
        type: "Error";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type">, children: string) => {
        type: "Error";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
    Failure: (props: Omit<{
        type: "Failure";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type">, children: string) => {
        type: "Failure";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
    Fragment: (props: Omit<{
        type: "Fragment";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement[];
    }, "type">, ...children: elements.AnyElement[]) => {
        type: "Fragment";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement[];
    };
    Group: (props: Omit<{
        type: "Group";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        title: string;
        children: any;
    }, "type">, ...children: elements.AnyElement[]) => {
        type: "Group";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        title: string;
        children: any;
    };
    Highlight: (props: Omit<{
        type: "Highlight";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type" | "children">, children: string) => {
        type: "Highlight";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
    Info: (props: Omit<{
        type: "Info";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type">, children: string) => {
        type: "Info";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
    Link: (props: Omit<{
        type: "Link";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        href: string;
        children: string;
    }, "type">, children: string) => {
        type: "Link";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        href: string;
        children: string;
    };
    List: (props: Omit<{
        type: "List";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement | elements.AnyElement[];
    }, "type" | "children">, children?: {
        type: "ListItem";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }[]) => {
        type: "List";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement | elements.AnyElement[];
    };
    ListItem: (props: Omit<{
        type: "ListItem";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type">, children: string) => {
        type: "ListItem";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
    Log: (props: Omit<{
        type: "Log";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type">, children: string) => {
        type: "Log";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
    Mask: (props: Omit<elements.IMask, "type">) => elements.IMask;
    Note: (props: Omit<{
        type: "Note";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type" | "children">, children: string) => {
        type: "Note";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
    Row: (props: Omit<{
        type: "Row";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement | elements.AnyElement[];
    }, "type" | "children">, children: string | elements.JSX | elements.JSX[] | null) => {
        type: "Row";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement | elements.AnyElement[];
    };
    Subtitle: (props: Omit<{
        type: "Subtitle";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type">, children: string) => {
        type: "Subtitle";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
    Success: (props: Omit<{
        type: "Success";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type">, children: string) => {
        type: "Success";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
    Table: (props: Omit<{
        type: "Table";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement | elements.AnyElement[];
    }, "type" | "children">, children?: ({
        type: "TableHeadings";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement | elements.AnyElement[];
    } | {
        type: "TableRow";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement | elements.AnyElement[];
    })[]) => {
        type: "Table";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement | elements.AnyElement[];
    };
    TableHeadings: (props: Omit<{
        type: "TableHeadings";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement | elements.AnyElement[];
    }, "type" | "children">, children?: {
        type: "TableCell";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }[]) => {
        type: "TableHeadings";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement | elements.AnyElement[];
    };
    TableRow: (props: Omit<{
        type: "TableRow";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement | elements.AnyElement[];
    }, "type" | "children">, children?: {
        type: "TableCell";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }[]) => {
        type: "TableRow";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: elements.AnyElement | elements.AnyElement[];
    };
    TableCell: (props: Omit<{
        type: "TableCell";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type">, children: string) => {
        type: "TableCell";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
    Text: (props: Omit<elements.IText, "type">) => elements.IText;
    Timestamp: (props: Omit<elements.ITimestamp, "type">) => elements.ITimestamp;
    Title: (props: Omit<{
        type: "Title";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type">, children: string) => {
        type: "Title";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
    Warning: (props: Omit<{
        type: "Warning";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    }, "type" | "children">, children: string) => {
        type: "Warning";
        style?: import("./elements/css/types.js").CSS | undefined;
        renderAS?: "ansi" | "markdown" | undefined;
        children: string;
    };
};
