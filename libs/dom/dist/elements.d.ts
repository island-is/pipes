type Simplify<T> = {
    [KeyType in keyof T]: T[KeyType];
} & {};
export type JSX = {
    type: string;
    children: AnyElement[] | AnyElement;
    props?: Record<string, any>;
};
export type SpecifixJSX<type extends string, props extends Record<string, any> | null, children extends (JSX | string | null)[] | null | string | JSX> = Simplify<props extends null ? {
    type: type;
} & {
    children: children;
} : {
    type: type;
} & props & {
    children: children;
}>;
export type AnyElement = JSX | string | null;
export type IMask = {
    type: "Mask";
    values: string[] | string;
};
export type IGroup = SpecifixJSX<"Group", {
    title: string;
}, any | any[]>;
export type IFragment = SpecifixJSX<"Fragment", null, AnyElement[]>;
export type ISuccess = SpecifixJSX<"Success", null, string>;
export type IContainer = SpecifixJSX<"Container", null, JSX | JSX[] | null | string>;
export type IRow = SpecifixJSX<"Row", null, AnyElement | AnyElement[] | null | string>;
export type IFailure = SpecifixJSX<"Failure", null, string>;
export type IError = SpecifixJSX<"Error", null, string>;
export type IInfo = SpecifixJSX<"Info", null, string>;
export type ILog = SpecifixJSX<"Log", null, string>;
export type ILink = SpecifixJSX<"Link", {
    href: string;
}, string>;
export type ITable = SpecifixJSX<"Table", null, AnyElement[] | AnyElement | null>;
export type ITableHeadings = SpecifixJSX<"TableHeadings", null, AnyElement[] | AnyElement | null>;
export type ITableRow = SpecifixJSX<"TableRow", null, AnyElement[] | AnyElement | null>;
export type ITableCell = SpecifixJSX<"TableCell", null, string>;
export type ITitle = SpecifixJSX<"Title", null, string>;
export type ISubtitle = SpecifixJSX<"Subtitle", null, string>;
export type IList = SpecifixJSX<"List", null, AnyElement[] | AnyElement | null>;
export type IListItem = SpecifixJSX<"ListItem", null, string>;
export type IDivider = {
    type: "Divider";
};
export type IHighlight = SpecifixJSX<"Highlight", null, string>;
export type ITimestamp = {
    type: "Timestamp";
    time?: Date | string | number;
    format?: string;
};
export type IBadge = SpecifixJSX<"Badge", null, string>;
export type IText = {
    type: "Text";
    value: string;
};
export type INote = SpecifixJSX<"Note", null, string>;
export type IWarning = SpecifixJSX<"Warning", null, string>;
export type CodeProps = {
    language?: string;
};
export type ICode = SpecifixJSX<"Code", CodeProps, AnyElement>;
export type DialogType = "default" | "error" | "success" | "failure";
export type DialogProps = {
    dialogType?: DialogType;
    message: string;
    paddingTop?: number;
    paddingBottom?: number;
};
export type IDialog = {
    type: "Dialog";
} & DialogProps;
export declare const Group: (props: Omit<IGroup, "type">, ...children: AnyElement[]) => IGroup;
export declare const Fragment: (props: Omit<IFragment, "type">, ...children: AnyElement[]) => IFragment;
export declare const Success: (props: Omit<ISuccess, "type">, children: string) => ISuccess;
export declare const Link: (props: Omit<ILink, "type">, children: string) => ILink;
export declare const Container: (props: Omit<IContainer, "type" | "children">, children: JSX | JSX[] | null | string) => IContainer;
export declare const Row: (props: Omit<IRow, "type" | "children">, children: JSX | JSX[] | null | string) => IRow;
export declare const Failure: (props: Omit<IFailure, "type">, children: string) => IFailure;
export declare const Error: (props: Omit<IError, "type">, children: string) => IError;
export declare const Info: (props: Omit<IInfo, "type">, children: string) => IInfo;
export declare const Log: (props: Omit<ILog, "type">, children: string) => ILog;
export declare const Table: (props: Omit<ITable, "type" | "children">, children?: (ITableHeadings | ITableRow)[]) => ITable;
export declare const TableHeadings: (props: Omit<ITableHeadings, "type" | "children">, children?: ITableCell[]) => ITableHeadings;
export declare const TableRow: (props: Omit<ITableRow, "type" | "children">, children?: ITableCell[]) => ITableRow;
export declare const TableCell: (props: Omit<ITableCell, "type">, children: string) => ITableCell;
export declare const Title: (props: Omit<ITitle, "type">, children: string) => ITitle;
export declare const Subtitle: (props: Omit<ISubtitle, "type">, children: string) => ISubtitle;
export declare const List: (props: Omit<IList, "type" | "children">, children?: IListItem[]) => IList;
export declare const ListItem: (props: Omit<IListItem, "type">, children: string) => IListItem;
export declare const Divider: (props: Omit<IDivider, "type">) => IDivider;
export declare const Highlight: (props: Omit<IHighlight, "type" | "children">, children: string) => IHighlight;
export declare const Timestamp: (props: Omit<ITimestamp, "type">) => ITimestamp;
export declare const Badge: (props: Omit<IBadge, "type">, children: string) => IBadge;
export declare const Text: (props: Omit<IText, "type">) => IText;
export declare const Note: (props: Omit<INote, "type" | "children">, children: string) => INote;
export declare const Warning: (props: Omit<IWarning, "type" | "children">, children: string) => IWarning;
export declare const Code: (props: Omit<ICode, "type">) => ICode;
export declare const Dialog: (props: Omit<IDialog, "type">) => IDialog;
export declare const Mask: (props: Omit<IMask, "type">) => IMask;
export type IPipeComponents = IMask | IGroup | IFragment | IDialog | IContainer | IRow | IText | ISuccess | IFailure | IError | IInfo | ILog | ITable | ITableHeadings | ITableRow | ITableCell | ITitle | ISubtitle | IList | IListItem | IDivider | IHighlight | ITimestamp | IBadge | INote | IWarning | ICode | string | null;
export type PipeComponents = typeof Mask | typeof Group | typeof Fragment | typeof Dialog | typeof Container | typeof Row | typeof Text | typeof Success | typeof Failure | typeof Error | typeof Info | typeof Log | typeof Table | typeof TableHeadings | typeof TableRow | typeof TableCell | typeof Title | typeof Subtitle | typeof List | typeof ListItem | typeof Divider | typeof Highlight | typeof Timestamp | typeof Badge | typeof Note | typeof Warning | typeof Code | {
    type: Function;
    props: any;
    children: any;
};
export {};
