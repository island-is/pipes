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
  } from "./elements.ts";
  namespace JSX {
    interface Element extends PipeComponents {}
    // The list of your custom elements
    interface IntrinsicElements {
      Fragment: Fragment;
      Dialog: Dialog;
      Container: Container;
      Row: Row;
      Text: Text;
      Success: Success;
      Failure: Failure;
      Error: Error;
      Info: Info;
      Log: Log;
      Table: Table;
      TableHeadings: TableHeadings;
      TableRow: TableRow;
      TableCell: TableCell;
      Title: Title;
      Subtitle: Subtitle;
      List: List;
      ListItem: ListItem;
      Divider: Divider;
      Highlight: Highlight;
      Timestamp: Timestamp;
      Badge: Badge;
      Note: Note;
      Warning: Warning;
      Code: Code;
    }

    interface ElementChildrenAttribute {
      children: PipeComponents | string | PipeComponents[];
    }
  }
}
