import type { IBadge } from "./badge.js";
import type { IContainer } from "./container.js";
import type { IDialog } from "./dialog.js";
import type { IDivider } from "./divider.js";
import type { IError } from "./error.js";
import type { IFailure } from "./failure.js";
import type { IGroup } from "./group.js";
import type { IInfo } from "./info.js";
import type { IList, IListItem } from "./list.js";
import type { ILog } from "./log.js";
import type { IMask } from "./mask.js";
import type { IRow } from "./row.js";
import type { ISubtitle } from "./subtitle.js";
import type { ISuccess } from "./success.js";
import type { ITimestamp } from "./timestamp.js";
import type { ITitle } from "./title.js";

export type IPipeComponents =
  | IMask
  | IGroup
  | IDialog
  | IContainer
  | IRow
  | ISuccess
  | IFailure
  | IError
  | IInfo
  | ILog
  | ITitle
  | ISubtitle
  | IList
  | IListItem
  | IDivider
  | ITimestamp
  | IBadge
  | string
  | null;
export type PipeComponents =
  | string
  | number
  | null
  | IMask
  | IGroup
  | IDialog
  | IContainer
  | IRow
  | ISuccess
  | IFailure
  | IError
  | IInfo
  | ILog
  | ITitle
  | ISubtitle
  | IList
  | IListItem
  | IDivider
  | ITimestamp
  | IBadge
  | { type: Function; props: any; children: any };
