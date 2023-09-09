import type { PipeComponents } from "./elements/elements.ts";

declare global {
  import type {
    Badge,
    Code,
    Container,
    Dialog,
    Divider,
    Error,
    Failure,
    Fragment,
    Highlight,
    Info,
    List,
    ListItem,
    Log,
    Note,
    Row,
    Subtitle,
    Success,
    Table,
    TableCell,
    TableHeadings,
    TableRow,
    Text,
    Timestamp,
    Title,
    Warning,
  } from "./elements.js";

  export namespace JSX {
    export type Element = PipeComponents;
    export interface IntrinsicElements {
      Fragment: typeof Fragment;
      Dialog: typeof Dialog;
      Container: typeof Container;
      Row: typeof Row;
      Text: typeof Text;
      Success: typeof Success;
      Failure: typeof Failure;
      Error: typeof Error;
      Group: typeof Group;
      Info: typeof Info;
      Log: typeof Log;
      Table: typeof Table;
      TableHeadings: typeof TableHeadings;
      TableRow: typeof TableRow;
      TableCell: typeof TableCell;
      Title: typeof Title;
      Subtitle: typeof Subtitle;
      List: typeof List;
      ListItem: typeof ListItem;
      Divider: typeof Divider;
      Highlight: typeof Highlight;
      Timestamp: typeof Timestamp;
      Badge: typeof Badge;
      Note: typeof Note;
      Warning: typeof Warning;
      Code: typeof Code;
    }

    export interface ElementChildrenAttribute {
      children: PipeComponents | string | number | null | PipeComponents[];
    }
  }
}
