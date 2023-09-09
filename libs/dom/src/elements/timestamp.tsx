export type ITimestamp = { type: "Timestamp"; time?: Date | string | number; format?: string };
export const Timestamp = (props: Omit<ITimestamp, "type" | "children">): ITimestamp => {
  return {
    type: "Timestamp",
    ...props,
  };
};
