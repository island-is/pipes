import type { Badge, IBadge } from "./badge.js";
import type { Code, ICode } from "./code.js";
import type { Container, IContainer } from "./container.js";
import type { Dialog, IDialog } from "./dialog.js";
import type { Divider, IDivider } from "./divider.js";
import type { IError } from "./error.js";
import type { Failure, IFailure } from "./failure.js";
import type { Fragment, IFragment } from "./fragment.js";
import type { Group, IGroup } from "./group.js";
import type { Highlight, IHighlight } from "./highlight.js";
import type { IInfo, Info } from "./info.js";
import type { IList, IListItem, List, ListItem } from "./list.js";
import type { ILog, Log } from "./log.js";
import type { IMask, Mask } from "./mask.js";
import type { INote, Note } from "./note.js";
import type { IRow, Row } from "./row.js";
import type { ISubtitle, Subtitle } from "./subtitle.js";
import type { ISuccess, Success } from "./success.js";
import type {
  ITable,
  ITableCell,
  ITableHeadings,
  ITableRow,
  Table,
  TableCell,
  TableHeadings,
  TableRow,
} from "./table.js";
import type { IText, Text } from "./text.js";
import type { ITimestamp, Timestamp } from "./timestamp.js";
import type { ITitle, Title } from "./title.js";
import type { IWarning, Warning } from "./warning.js";

export type IPipeComponents =
  | IMask
  | IGroup
  | IFragment
  | IDialog
  | IContainer
  | IRow
  | IText
  | ISuccess
  | IFailure
  | IError
  | IInfo
  | ILog
  | ITable
  | ITableHeadings
  | ITableRow
  | ITableCell
  | ITitle
  | ISubtitle
  | IList
  | IListItem
  | IDivider
  | IHighlight
  | ITimestamp
  | IBadge
  | INote
  | IWarning
  | ICode
  | string
  | null;
export type PipeComponents =
  | typeof Mask
  | typeof Group
  | typeof Fragment
  | typeof Dialog
  | typeof Container
  | typeof Row
  | typeof Text
  | typeof Success
  | typeof Failure
  | typeof Error
  | typeof Info
  | typeof Log
  | typeof Table
  | typeof TableHeadings
  | typeof TableRow
  | typeof TableCell
  | typeof Title
  | typeof Subtitle
  | typeof List
  | typeof ListItem
  | typeof Divider
  | typeof Highlight
  | typeof Timestamp
  | typeof Badge
  | typeof Note
  | typeof Warning
  | typeof Code
  | { type: Function; props: any; children: any };
