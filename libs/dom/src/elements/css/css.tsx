import { CSS_COLORS, isCSSColor } from "./colors.js";
import { CSS_FONT_STYLES, isFontStyle } from "./fonts.js";
import { TEXT_ALIGNS, isNotNull } from "./types.js";
import { convertDimension, cssBorderToComputed, dimensionToObject, getValue } from "./utility.js";

import type { CSS, ComputedCSS, notNull } from "./types.js";

export const computeCSS = (css: CSS, width: number): ComputedCSS => {
  const padding = dimensionToObject(css.padding);
  const margin = dimensionToObject(css.margin);
  const getWidth = () => {
    if (typeof css.width === "undefined") {
      return undefined;
    }
    if (css.width === "auto") {
      return undefined;
    }
    if (parseInt(`${css.width}`, 10) < 0) {
      return undefined;
    }
    return Math.min(convertDimension(css.width) ?? 0, width);
  };
  const computedCSS: ComputedCSS = {
    color: isCSSColor(css.color) ? getValue(CSS_COLORS, css.color) : undefined,
    backgroundColor: isCSSColor(css.backgroundColor) ? getValue(CSS_COLORS, css.backgroundColor) : undefined,
    fontStyle:
      typeof css.fontStyle !== "undefined"
        ? css.fontStyle
            .split(" ")
            .map((e) => (isFontStyle(e) ? getValue(CSS_FONT_STYLES, e) : null))
            .filter((e): e is notNull<typeof e> => isNotNull(e))
        : undefined,
    width: getWidth(),
    height: convertDimension(css.height),
    paddingTop: padding?.top,
    paddingLeft: padding?.left,
    paddingRight: padding?.right,
    paddingBottom: padding?.bottom,
    marginTop: margin?.top,
    marginLeft: margin?.left,
    marginRight: margin?.right,
    marginBottom: margin?.bottom,
    ...cssBorderToComputed(css.border),
    textAlign: css.textAlign && TEXT_ALIGNS.includes(css.textAlign.toUpperCase()) ? css.textAlign : undefined,
    hidden: css.hidden,
    visibility: !(css.visibility === false),
  };
  return Object.entries(computedCSS).reduce((obj, [key, value]) => {
    if (typeof value === "undefined" || value === null) {
      return obj;
    }
    obj[key as keyof ComputedCSS] = value;
    return obj;
  }, {} as ComputedCSS);
};
