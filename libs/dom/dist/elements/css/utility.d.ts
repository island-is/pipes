import type { CSS_BORDER, CSS_DIMENSION_STYLE, CSS_PADDING_MARGIN } from "./types.js";
export declare const convertDimension: (value: CSS_DIMENSION_STYLE | string | undefined | null) => number | undefined;
export declare const dimensionToObject: (style: CSS_PADDING_MARGIN | undefined) => {
    top: number | undefined;
    right: number | undefined;
    bottom: number | undefined;
    left: number | undefined;
} | undefined;
export declare const cssBorderToComputed: (css: CSS_BORDER | undefined) => {
    borderTop: CSS_BORDER["top"] | undefined;
    borderLeft: CSS_BORDER["left"] | undefined;
    borderRight: CSS_BORDER["right"] | undefined;
    borderBottom: CSS_BORDER["bottom"] | undefined;
    borderStyle: CSS_BORDER["style"] | undefined;
    borderColor: CSS_BORDER["color"] | undefined;
    borderBackgroundColor: CSS_BORDER["backgroundColor"] | undefined;
};
export declare const validateEnumValue: (obj: unknown, value: unknown) => boolean;
export declare const getValue: <T extends Record<string, any>, X extends string>(obj: T, value: X) => T[keyof T] | undefined;
