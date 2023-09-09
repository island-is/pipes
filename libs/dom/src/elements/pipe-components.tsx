import type { IBadge } from "./badge.js";
import type { ICode } from "./code.js";
import type { IContainer } from "./container.js";
import type { IDialog } from "./dialog.js";
import type { IDivider } from "./divider.js";
import type { IError } from "./error.js";
import type { IFailure } from "./failure.js";
import type { IFragment } from "./fragment.js";
import type { IGroup } from "./group.js";
import type { IHighlight } from "./highlight.js";
import type { IInfo } from "./info.js";
import type { IList, IListItem } from "./list.js";
import type { ILog } from "./log.js";
import type { IMask } from "./mask.js";
import type { INote } from "./note.js";
import type { IRow } from "./row.js";
import type { ISubtitle } from "./subtitle.js";
import type { ISuccess } from "./success.js";
import type { ITable, ITableCell, ITableHeadings, ITableRow } from "./table.js";
import type { IText } from "./text.js";
import type { ITimestamp } from "./timestamp.js";
import type { ITitle } from "./title.js";
import type { IWarning } from "./warning.js";

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
  | string
  | number
  | null
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
  | { type: Function; props: any; children: any };
