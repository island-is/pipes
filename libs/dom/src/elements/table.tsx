import type { AnyElement, SpecifixJSX } from "./jsx.js";

export type ITable = SpecifixJSX<"Table", null, AnyElement[] | AnyElement | null>;
export type ITableHeadings = SpecifixJSX<"TableHeadings", null, AnyElement[] | AnyElement | null>;
export type ITableRow = SpecifixJSX<"TableRow", null, AnyElement[] | AnyElement | null>;
export type ITableCell = SpecifixJSX<"TableCell", null, string>;
export const Table = (
  props: Omit<ITable, "type" | "children">,
  children: (ITableHeadings | ITableRow)[] = [],
): ITable => {
  return {
    type: "Table",
    ...props,
    children,
  };
};

export const TableHeadings = (
  props: Omit<ITableHeadings, "type" | "children">,
  children: ITableCell[] = [],
): ITableHeadings => {
  return {
    type: "TableHeadings",
    ...props,
    children,
  };
};

export const TableRow = (props: Omit<ITableRow, "type" | "children">, children: ITableCell[] = []): ITableRow => {
  return {
    type: "TableRow",
    ...props,
    children,
  };
};

export const TableCell = (props: Omit<ITableCell, "type">, children: string): ITableCell => {
  return {
    type: "TableCell",
    ...props,
    children,
  };
};
