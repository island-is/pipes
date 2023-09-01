import type { SpecifixJSX } from "./jsx.js";

export type INote = SpecifixJSX<"Note", null, string>;
export const Note = (props: Omit<INote, "type" | "children">, children: string): INote => {
  return {
    type: "Note",
    ...props,
    children,
  };
};
