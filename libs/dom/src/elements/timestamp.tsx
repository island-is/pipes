export type ITimestamp = { type: "Timestamp"; time?: Date | string | number; format?: string };
export const Timestamp = (props: Omit<ITimestamp, "type">): ITimestamp => {
  return {
    type: "Timestamp",
    ...props,
  };
};
