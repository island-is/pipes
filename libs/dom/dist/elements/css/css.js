import { CSS_COLORS, isCSSColor } from "./colors.js";
import { CSS_FONT_STYLES, isFontStyle } from "./fonts.js";
import { TEXT_ALIGNS, isNotNull } from "./types.js";
import { convertDimension, cssBorderToComputed, dimensionToObject, getValue } from "./utility.js";
export const computeCSS = (css)=>{
    const padding = dimensionToObject(css.padding);
    const margin = dimensionToObject(css.margin);
    const computedCSS = {
        color: isCSSColor(css.color) ? getValue(CSS_COLORS, css.color) : undefined,
        backgroundColor: isCSSColor(css.backgroundColor) ? getValue(CSS_COLORS, css.backgroundColor) : undefined,
        fontStyle: typeof css.fontStyle !== "undefined" ? css.fontStyle.split(" ").map((e)=>isFontStyle(e) ? getValue(CSS_FONT_STYLES, e) : null).filter((e)=>isNotNull(e)) : undefined,
        width: css.hidden ? 0 : convertDimension(css.width),
        height: convertDimension(css.width),
        paddingTop: padding?.top,
        paddingLeft: padding?.left,
        paddingRight: padding?.right,
        paddingBottom: padding?.bottom,
        marginTop: margin?.top,
        marginLeft: margin?.left,
        marginRight: margin?.right,
        marginBottom: margin?.bottom,
        ...cssBorderToComputed(css.border),
        textAlign: css.textAlign && TEXT_ALIGNS.includes(css.textAlign) ? css.textAlign : undefined,
        hidden: css.hidden,
        visibility: css.visibility
    };
    return Object.entries(computedCSS).reduce((obj, [key, value])=>{
        if (typeof value === "undefined" || value === null) {
            return obj;
        }
        obj[key] = value;
        return obj;
    }, {});
};
