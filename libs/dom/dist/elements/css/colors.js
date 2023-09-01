import { validateEnumValue } from "./utility.js";
export const CSS_COLORS = {
    DEFAULT: {
        ansi: {
            fg: "\u001b[0m",
            bg: "\u001b[49m"
        },
        hex: "#333"
    },
    BLUE: {
        ansi: {
            fg: "\u001b[34m",
            bg: "\u001b[44m"
        },
        hex: "#0000FF"
    },
    RED: {
        ansi: {
            fg: "\u001b[31m",
            bg: "\u001b[41m"
        },
        hex: "#FF0000"
    },
    GREEN: {
        ansi: {
            fg: "\u001b[32m",
            bg: "\u001b[42m"
        },
        hex: "#00FF00"
    },
    YELLOW: {
        ansi: {
            fg: "\u001b[33m",
            bg: "\u001b[43m"
        },
        hex: "#FFFF00"
    },
    CYAN: {
        ansi: {
            fg: "\u001b[36m",
            bg: "\u001b[46m"
        },
        hex: "#00FFFF"
    },
    BLACK: {
        ansi: {
            fg: "\u001b[30m",
            bg: "\u001b[40m"
        },
        hex: "#000000"
    },
    WHITE: {
        ansi: {
            fg: "\u001b[37m",
            bg: "\u001b[47m"
        },
        hex: "#FFFFFF"
    },
    MAGENTA: {
        ansi: {
            fg: "\u001b[35m",
            bg: "\u001b[45m"
        },
        hex: "#FF00FF"
    },
    ORANGE: {
        ansi: {
            fg: "\u001b[38;5;214m",
            bg: "\u001b[48;5;214m"
        },
        hex: "#FFA500"
    },
    LIGHT_BLUE: {
        ansi: {
            fg: "\u001b[38;5;87m",
            bg: "\u001b[48;5;87m"
        },
        hex: "#ADD8E6"
    },
    LIGHT_GREEN: {
        ansi: {
            fg: "\u001b[38;5;118m",
            bg: "\u001b[48;5;118m"
        },
        hex: "#90EE90"
    },
    LIGHT_RED: {
        ansi: {
            fg: "\u001b[38;5;203m",
            bg: "\u001b[48;5;203m"
        },
        hex: "#FF6666"
    },
    PURPLE: {
        ansi: {
            fg: "\u001b[38;5;129m",
            bg: "\u001b[48;5;129m"
        },
        hex: "#800080"
    },
    GRAY: {
        ansi: {
            fg: "\u001b[38;5;244m",
            bg: "\u001b[48;5;244m"
        },
        hex: "#808080"
    },
    BROWN: {
        ansi: {
            fg: "\u001b[38;5;130m",
            bg: "\u001b[48;5;130m"
        },
        hex: "#A52A2A"
    },
    PINK: {
        ansi: {
            fg: "\u001b[38;5;206m",
            bg: "\u001b[48;5;206m"
        },
        hex: "#FFC0CB"
    },
    TEAL: {
        ansi: {
            fg: "\u001b[38;5;6m",
            bg: "\u001b[48;5;6m"
        },
        hex: "#008080"
    }
};
export const isCSSColor = (value)=>{
    return validateEnumValue(CSS_COLORS, value);
};
