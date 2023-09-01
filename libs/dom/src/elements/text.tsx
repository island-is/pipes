export type IText = { type: "Text"; value: string };
export const Text = (props: Omit<IText, "type">): IText => {
  return {
    type: "Text",
    ...props,
  };
};
