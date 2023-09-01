import type { AnyElement, SpecifixJSX } from "./jsx.js";
export type ITable = SpecifixJSX<"Table", null, AnyElement[] | AnyElement | null>;
export type ITableHeadings = SpecifixJSX<"TableHeadings", null, AnyElement[] | AnyElement | null>;
export type ITableRow = SpecifixJSX<"TableRow", null, AnyElement[] | AnyElement | null>;
export type ITableCell = SpecifixJSX<"TableCell", null, string>;
export declare const Table: (props: Omit<ITable, "type" | "children">, children?: (ITableHeadings | ITableRow)[]) => ITable;
export declare const TableHeadings: (props: Omit<ITableHeadings, "type" | "children">, children?: ITableCell[]) => ITableHeadings;
export declare const TableRow: (props: Omit<ITableRow, "type" | "children">, children?: ITableCell[]) => ITableRow;
export declare const TableCell: (props: Omit<ITableCell, "type">, children: string) => ITableCell;
