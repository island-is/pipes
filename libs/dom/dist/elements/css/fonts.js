import { validateEnumValue } from "./utility.js";
export const CSS_FONT_STYLES = {
    BOLD: {
        ansi: {
            startTag: "\u001b[1m",
            endTag: "\u001b[22m"
        },
        html: {
            startTag: "<strong>",
            endTag: "</strong>"
        }
    },
    ITALIC: {
        ansi: {
            startTag: "\u001b[3m",
            endTag: "\u001b[23m"
        },
        html: {
            startTag: "<em>",
            endTag: "</em>"
        }
    },
    UNDERLINE: {
        ansi: {
            startTag: "\u001b[4m",
            endTag: "\u001b[24m"
        },
        html: {
            startTag: "<u>",
            endTag: "</u>"
        }
    },
    STRIKETHROUGH: {
        ansi: {
            startTag: "\u001b[9m",
            endTag: "\u001b[29m"
        },
        html: {
            startTag: "<s>",
            endTag: "</s>"
        }
    }
};
const cssFontStyles = [
    "bold",
    "italic",
    "underline",
    "strikethrough"
];
export const isFontStyle = (value)=>{
    return validateEnumValue(CSS_FONT_STYLES, value);
};
