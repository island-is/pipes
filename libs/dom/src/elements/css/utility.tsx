import type { CSS_BORDER, CSS_DIMENSION_STYLE, CSS_PADDING_MARGIN } from "./types.js";

export const convertDimension = (value: CSS_DIMENSION_STYLE | string | undefined | null): number | undefined => {
  if (!value || value === "auto") {
    return undefined;
  }
  const parsedValue = typeof value === "number" ? value : parseInt(value, 10);
  if (isNaN(parsedValue)) {
    return undefined;
  }
  if (parsedValue < 0) {
    return undefined;
  }
  return parsedValue;
};
export const dimensionToObject = (style: CSS_PADDING_MARGIN | undefined) => {
  if (!style) return undefined;
  if (typeof style === "string") {
    const values = style.split(" ").map((val) => convertDimension(val));
    if (values.length > 4 || values.length < 1) {
      throw new Error(`Invalid number of dimensions: ${values.length}`);
    }
    switch (values.length) {
      case 1:
        return { top: values[0], right: values[0], bottom: values[0], left: values[0] };
      case 2:
        return { top: values[0], right: values[1], bottom: values[0], left: values[1] };
      case 3:
        return { top: values[0], right: values[1], bottom: values[2], left: values[1] };
      case 4:
        return { top: values[0], right: values[1], bottom: values[2], left: values[3] };
    }
  } else {
    return {
      top: convertDimension(style.top),
      right: convertDimension(style.right),
      bottom: convertDimension(style.bottom),
      left: convertDimension(style.left),
    };
  }
};
export const cssBorderToComputed = (
  css: CSS_BORDER | undefined,
): {
  borderTop: CSS_BORDER["top"] | undefined;
  borderLeft: CSS_BORDER["left"] | undefined;
  borderRight: CSS_BORDER["right"] | undefined;
  borderBottom: CSS_BORDER["bottom"] | undefined;
  borderStyle: CSS_BORDER["style"] | undefined;
  borderColor: CSS_BORDER["color"] | undefined;
  borderBackgroundColor: CSS_BORDER["backgroundColor"] | undefined;
} => {
  const obj: ReturnType<typeof cssBorderToComputed> = {
    borderTop: undefined,
    borderLeft: undefined,
    borderRight: undefined,
    borderBottom: undefined,
    borderStyle: undefined,
    borderColor: undefined,
    borderBackgroundColor: undefined,
  };
  if (!css) {
    return obj;
  }
  if (css.style) {
    obj.borderStyle = css.style;
  }
  if (css.color) {
    obj.borderColor = css.color;
  }
  if (css.backgroundColor) {
    obj.borderBackgroundColor = css.backgroundColor;
  }
  if (css.enabled) {
    obj.borderTop = true;
    obj.borderBottom = true;
    obj.borderLeft = true;
    obj.borderRight = true;
  }
  ["Top", "Left", "Right", "Bottom"].forEach((value) => {
    const cssKey = `${value.toLowerCase()}` as keyof typeof css;
    const objKey = `border${value}` as keyof typeof obj;
    if (typeof css[cssKey] !== "undefined") {
      obj[objKey] = css[cssKey] as any;
    }
  });
  return obj;
};
export const validateEnumValue = (obj: unknown, value: unknown): boolean => {
  return !!(
    typeof value === "string" &&
    obj &&
    typeof obj === "object" &&
    Object.keys(obj).includes(value.toUpperCase())
  );
};
export const getValue = <T extends Record<string, any>, X extends string>(obj: T, value: X): T[keyof T] | undefined => {
  return (obj[value.toUpperCase() as keyof typeof obj] as T[X]) ?? undefined;
};
