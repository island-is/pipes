import { validateEnumValue } from "./utility.js";

export const CSS_FONT_STYLES = {
  BOLD: {
    ansi: {
      startTag: "\u001b[1m",
      endTag: "\u001b[22m",
    },
    html: {
      startTag: "<strong>",
      endTag: "</strong>",
    },
  },
  ITALIC: {
    ansi: {
      startTag: "\u001b[3m",
      endTag: "\u001b[23m",
    },
    html: {
      startTag: "<em>",
      endTag: "</em>",
    },
  },
  UNDERLINE: {
    ansi: {
      startTag: "\u001b[4m",
      endTag: "\u001b[24m",
    },
    html: {
      startTag: "<u>",
      endTag: "</u>",
    },
  },
  STRIKETHROUGH: {
    ansi: {
      startTag: "\u001b[9m",
      endTag: "\u001b[29m",
    },
    html: {
      startTag: "<s>",
      endTag: "</s>",
    },
  },
} as const;
type _CSS_FONT_STYLE = Lowercase<keyof typeof CSS_FONT_STYLES>;
const cssFontStyles: _CSS_FONT_STYLE[] = ["bold", "italic", "underline", "strikethrough"];
type GenerateFontStyleSet<
  N extends number = (typeof cssFontStyles)["length"],
  X extends Array<0> = [],
  str extends string = "",
> = X["length"] extends N
  ? str
  : `${str}${_CSS_FONT_STYLE}` | GenerateFontStyleSet<N, [0, ...X], `${str}${_CSS_FONT_STYLE} `>;
export type CSS_FONT_STYLE = GenerateFontStyleSet<4, []>;

export const isFontStyle = (value: unknown): value is CSS_FONT_STYLE => {
  return validateEnumValue(CSS_FONT_STYLES, value);
};
