import * as CI from "./ci.js";
import * as elements from "./elements/elements.js";
import * as factory from "./factory.js";

import type {
  Badge,
  Code,
  Container,
  Dialog,
  Divider,
  Error,
  Failure,
  Fragment,
  Group,
  Highlight,
  Info,
  List,
  ListItem,
  Log,
  Note,
  PipeComponents,
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
} from "./elements/elements.js";
export type {
  Badge,
  Code,
  Container,
  Dialog,
  Divider,
  Error,
  Failure,
  Fragment,
  Highlight,
  IFragment,
  Info,
  List,
  ListItem,
  Log,
  Note,
  PipeComponents,
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
} from "./elements/elements.js";
export const PipesDOM = {
  ...elements,
  ...factory,
  ...CI,
};

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

export { DOMError } from "./dom-error.js";
