export const convertDimension = (value)=>{
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
export const dimensionToObject = (style)=>{
    if (!style) return undefined;
    if (typeof style === "string") {
        const values = style.split(" ").map((val)=>convertDimension(val));
        if (values.length > 4 || values.length < 1) {
            throw new Error(`Invalid number of dimensions: ${values.length}`);
        }
        switch(values.length){
            case 1:
                return {
                    top: values[0],
                    right: values[0],
                    bottom: values[0],
                    left: values[0]
                };
            case 2:
                return {
                    top: values[0],
                    right: values[1],
                    bottom: values[0],
                    left: values[1]
                };
            case 3:
                return {
                    top: values[0],
                    right: values[1],
                    bottom: values[2],
                    left: values[1]
                };
            case 4:
                return {
                    top: values[0],
                    right: values[1],
                    bottom: values[2],
                    left: values[3]
                };
        }
    } else {
        return {
            top: convertDimension(style.top),
            right: convertDimension(style.right),
            bottom: convertDimension(style.bottom),
            left: convertDimension(style.left)
        };
    }
};
export const cssBorderToComputed = (css)=>{
    const obj = {
        borderTop: undefined,
        borderLeft: undefined,
        borderRight: undefined,
        borderBottom: undefined,
        borderStyle: undefined,
        borderColor: undefined,
        borderBackgroundColor: undefined
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
    [
        "Top",
        "Left",
        "Right",
        "Bottom"
    ].forEach((value)=>{
        const cssKey = `${value.toLowerCase()}`;
        const objKey = `border${value}`;
        if (typeof css[cssKey] !== "undefined") {
            obj[objKey] = css[cssKey];
        }
    });
    return obj;
};
export const validateEnumValue = (obj, value)=>{
    return !!(typeof value === "string" && obj && typeof obj === "object" && Object.keys(obj).includes(value.toUpperCase()));
};
export const getValue = (obj, value)=>{
    return obj[value.toUpperCase()] ?? undefined;
};
