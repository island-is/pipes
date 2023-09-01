export type ITimestamp = {
    type: "Timestamp";
    time?: Date | string | number;
    format?: string;
};
export declare const Timestamp: (props: Omit<ITimestamp, "type">) => ITimestamp;
