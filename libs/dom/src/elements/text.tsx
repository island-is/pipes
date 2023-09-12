export type IText = { type: "Text"; value: string };
export const Text = (props: Omit<IText, "type">): IText => {
  return {
    type: "Text",
    ...props,
  };
};

export const renderText = {
  ansi:
    (_render: (child: any, width: number) => string) =>
    (component: IText, _width: number): string => {
      return component.value || "";
    },
  markdown:
    (_render: (child: any, _width: number) => string) =>
    (_component: IText, _width: number): string => {
      return _component.value || "";
    },
};
