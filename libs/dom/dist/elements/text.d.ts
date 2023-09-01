export type IText = {
    type: "Text";
    value: string;
};
export declare const Text: (props: Omit<IText, "type">) => IText;
