import type { CSS_COLORS, CSS_COLOR_STYLE } from "./colors.js";
import type { CSS_FONT_STYLE, CSS_FONT_STYLES } from "./fonts.js";
export type CSS_BORDER_STYLE = "solid" | "dotted" | "dashed" | "double";
export type CSS_DIMENSION_STYLE = `${number}ch` | "auto" | number;
export type CSS_PADDING_MARGIN = {
    top?: CSS_DIMENSION_STYLE;
    right?: CSS_DIMENSION_STYLE;
    bottom?: CSS_DIMENSION_STYLE;
    left?: CSS_DIMENSION_STYLE;
} | `${CSS_DIMENSION_STYLE} ${CSS_DIMENSION_STYLE} ${CSS_DIMENSION_STYLE} ${CSS_DIMENSION_STYLE}` | `${CSS_DIMENSION_STYLE} ${CSS_DIMENSION_STYLE} ${CSS_DIMENSION_STYLE}` | `${CSS_DIMENSION_STYLE} ${CSS_DIMENSION_STYLE}` | `${CSS_DIMENSION_STYLE}`;
export type CSS_BORDER = {
    enabled?: boolean;
    style?: CSS_BORDER_STYLE;
    color?: CSS_COLOR_STYLE;
    backgroundColor?: CSS_COLOR_STYLE;
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
};
export interface CSS {
    color?: CSS_COLOR_STYLE;
    backgroundColor?: CSS_COLOR_STYLE;
    fontStyle?: CSS_FONT_STYLE;
    width?: CSS_DIMENSION_STYLE;
    height?: CSS_DIMENSION_STYLE;
    padding?: CSS_PADDING_MARGIN;
    margin?: CSS_PADDING_MARGIN;
    textAlign?: "left" | "center" | "right";
    border?: CSS_BORDER;
    hidden?: boolean;
    visibility?: boolean;
}
export declare const TEXT_ALIGNS: string[];
export interface ComputedCSS {
    color?: (typeof CSS_COLORS)[keyof typeof CSS_COLORS];
    backgroundColor?: (typeof CSS_COLORS)[keyof typeof CSS_COLORS];
    fontStyle?: (typeof CSS_FONT_STYLES)[keyof typeof CSS_FONT_STYLES][];
    width?: number;
    height?: number;
    paddingTop?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingBottom?: number;
    marginTop?: number;
    marginLeft?: number;
    marginRight?: number;
    marginBottom?: number;
    textAlign?: "left" | "center" | "right";
    borderTop?: CSS_BORDER["top"];
    borderLeft?: CSS_BORDER["left"];
    borderRight?: CSS_BORDER["right"];
    borderBottom?: CSS_BORDER["bottom"];
    borderStyle?: CSS_BORDER["style"];
    borderColor?: CSS_BORDER["color"];
    borderBackgroundColor?: CSS_BORDER["backgroundColor"];
    hidden?: boolean;
    visibility?: boolean;
}
export type notNull<T extends unknown> = Exclude<T, null | undefined>;
export declare const isNotNull: <T extends unknown>(arg: T) => arg is Exclude<T, null | undefined>;
