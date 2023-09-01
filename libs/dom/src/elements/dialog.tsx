export type DialogType = "default" | "error" | "success" | "failure";
export type DialogProps = {
  dialogType?: DialogType;
  message: string;
  paddingTop?: number; // number of lines
  paddingBottom?: number; // number of lines
};
export type IDialog = { type: "Dialog" } & DialogProps;
export const Dialog = (props: Omit<IDialog, "type">): IDialog => {
  return {
    type: "Dialog",
    ...props,
  };
};
