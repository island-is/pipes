import formatDate from "date-fns/format/index.js";
import enGB from "date-fns/locale/en-GB/index.js";
import enUS from "date-fns/locale/en-US/index.js";

import { span } from "./css/span.js";

import type { PipeComponents } from "./pipe-components.js";

export type ITimestamp = {
  type: "Timestamp";
  time?: Date | string | number;
  format?: "ISO" | "American" | "European" | string;
};
export const Timestamp = (props: Omit<ITimestamp, "type" | "children">): ITimestamp => {
  return {
    type: "Timestamp",
    ...props,
  };
};

export const renderTimestamp = {
  ansi:
    (_render: (component: PipeComponents, width: number) => string) =>
    (component: ITimestamp): string => {
      let date: Date;
      const invalidTime = span("Invalid date", {
        color: "red",
      })[0];
      if (component.time) {
        if (typeof component.time === "string" || typeof component.time === "number") {
          date = new Date(component.time);
        } else {
          date = component.time;
        }
      } else {
        date = new Date();
      }

      if (isNaN(date.getTime())) {
        return invalidTime;
      }

      const format = component.format || "ISO";
      let formattedDate: string;
      switch (format) {
        case "ISO":
          formattedDate = date.toISOString();
          break;
        case "European":
          formattedDate = formatDate(date, "PPpp", { locale: enGB });
          break;
        case "American":
          formattedDate = formatDate(date, "PPpp", { locale: enUS });
          break;
        default:
          try {
            formattedDate = formatDate(date, format);
          } catch (e) {
            return span("Invalid date format", {
              color: "red",
            })[0];
          }
      }

      return span(formattedDate, {
        color: "blue",
      }).join("");
    },

  markdown:
    (_render: (component: PipeComponents, width: number) => string) =>
    (_component: ITimestamp, _width: number): string => {
      throw new Error("Not implemented");
    },
};
