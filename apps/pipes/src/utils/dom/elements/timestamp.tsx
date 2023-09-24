import formatDate from "date-fns/format/index.js";
import enGB from "date-fns/locale/en-GB/index.js";
import enUS from "date-fns/locale/en-US/index.js";
import React from "react";

import { Text } from "../../ink/index.js";

import type { ReactNode } from "react";

export type ITimestamp = {
  type: "Timestamp";
  time?: Date | string | number;
  format?: "ISO" | "American" | "European" | string;
};
export const Timestamp = (props: Omit<ITimestamp, "type">): ReactNode => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return renderTimestamp.ansi({
    type: "Timestamp",
    ...props,
  });
};

const invalidTime = <Text color="red">Invalid date</Text>;
const invalidDateFormat = <Text color="red">Invalid date format</Text>;

export const renderTimestamp = {
  ansi: (component: ITimestamp): ReactNode => {
    let date: Date;

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
          return invalidDateFormat;
        }
    }

    return (
      <Text color="white" backgroundColor={"blue"}>
        {formattedDate}
      </Text>
    );
  },

  markdown: (_component: ITimestamp): string => {
    throw new Error("Not implemented");
  },
};
