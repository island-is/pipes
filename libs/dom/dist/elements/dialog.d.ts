export type DialogType = "default" | "error" | "success" | "failure";
export type DialogProps = {
    dialogType?: DialogType;
    message: string;
    paddingTop?: number;
    paddingBottom?: number;
};
export type IDialog = {
    type: "Dialog";
} & DialogProps;
export declare const Dialog: (props: Omit<IDialog, "type">) => IDialog;
