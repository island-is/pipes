export type IMask = {
    type: "Mask";
    values: string[] | string;
};
export declare const Mask: (props: Omit<IMask, "type">) => IMask;
