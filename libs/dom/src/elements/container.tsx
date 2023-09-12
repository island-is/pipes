import type { JSX, SpecifixJSX } from "./jsx.js";

export type IContainer = SpecifixJSX<"Container", null, JSX | JSX[] | null | string>;
export const Container = (props: Omit<IContainer, "type" | "children">, children: JSX[]): IContainer => {
  return {
    type: "Container",
    ...props,
    children,
  };
};

export const renderContainer = {
  ansi:
    (render: (child: any, width: number) => string) =>
    (component: IContainer, width: number): string => {
      if (Array.isArray(component.children)) {
        const values = component.children.map((child) => render(child, width)).join(" ".repeat(width * 2));
        return values;
      } else {
        return render(component.children, width);
      }
    },

  markdown:
    (render: (child: any) => string) =>
    (component: IContainer): string => {
      if (Array.isArray(component.children)) {
        return component.children.map(render).join("\n\n");
      } else {
        return render(component.children);
      }
    },
};
