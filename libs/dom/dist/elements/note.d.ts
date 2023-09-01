import type { SpecifixJSX } from "./jsx.js";
export type INote = SpecifixJSX<"Note", null, string>;
export declare const Note: (props: Omit<INote, "type" | "children">, children: string) => INote;
