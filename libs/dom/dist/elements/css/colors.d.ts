export declare const CSS_COLORS: {
    readonly DEFAULT: {
        readonly ansi: {
            readonly fg: "\u001B[0m";
            readonly bg: "\u001B[49m";
        };
        readonly hex: "#333";
    };
    readonly BLUE: {
        readonly ansi: {
            readonly fg: "\u001B[34m";
            readonly bg: "\u001B[44m";
        };
        readonly hex: "#0000FF";
    };
    readonly RED: {
        readonly ansi: {
            readonly fg: "\u001B[31m";
            readonly bg: "\u001B[41m";
        };
        readonly hex: "#FF0000";
    };
    readonly GREEN: {
        readonly ansi: {
            readonly fg: "\u001B[32m";
            readonly bg: "\u001B[42m";
        };
        readonly hex: "#00FF00";
    };
    readonly YELLOW: {
        readonly ansi: {
            readonly fg: "\u001B[33m";
            readonly bg: "\u001B[43m";
        };
        readonly hex: "#FFFF00";
    };
    readonly CYAN: {
        readonly ansi: {
            readonly fg: "\u001B[36m";
            readonly bg: "\u001B[46m";
        };
        readonly hex: "#00FFFF";
    };
    readonly BLACK: {
        readonly ansi: {
            readonly fg: "\u001B[30m";
            readonly bg: "\u001B[40m";
        };
        readonly hex: "#000000";
    };
    readonly WHITE: {
        readonly ansi: {
            readonly fg: "\u001B[37m";
            readonly bg: "\u001B[47m";
        };
        readonly hex: "#FFFFFF";
    };
    readonly MAGENTA: {
        readonly ansi: {
            readonly fg: "\u001B[35m";
            readonly bg: "\u001B[45m";
        };
        readonly hex: "#FF00FF";
    };
    readonly ORANGE: {
        readonly ansi: {
            readonly fg: "\u001B[38;5;214m";
            readonly bg: "\u001B[48;5;214m";
        };
        readonly hex: "#FFA500";
    };
    readonly LIGHT_BLUE: {
        readonly ansi: {
            readonly fg: "\u001B[38;5;87m";
            readonly bg: "\u001B[48;5;87m";
        };
        readonly hex: "#ADD8E6";
    };
    readonly LIGHT_GREEN: {
        readonly ansi: {
            readonly fg: "\u001B[38;5;118m";
            readonly bg: "\u001B[48;5;118m";
        };
        readonly hex: "#90EE90";
    };
    readonly LIGHT_RED: {
        readonly ansi: {
            readonly fg: "\u001B[38;5;203m";
            readonly bg: "\u001B[48;5;203m";
        };
        readonly hex: "#FF6666";
    };
    readonly PURPLE: {
        readonly ansi: {
            readonly fg: "\u001B[38;5;129m";
            readonly bg: "\u001B[48;5;129m";
        };
        readonly hex: "#800080";
    };
    readonly GRAY: {
        readonly ansi: {
            readonly fg: "\u001B[38;5;244m";
            readonly bg: "\u001B[48;5;244m";
        };
        readonly hex: "#808080";
    };
    readonly BROWN: {
        readonly ansi: {
            readonly fg: "\u001B[38;5;130m";
            readonly bg: "\u001B[48;5;130m";
        };
        readonly hex: "#A52A2A";
    };
    readonly PINK: {
        readonly ansi: {
            readonly fg: "\u001B[38;5;206m";
            readonly bg: "\u001B[48;5;206m";
        };
        readonly hex: "#FFC0CB";
    };
    readonly TEAL: {
        readonly ansi: {
            readonly fg: "\u001B[38;5;6m";
            readonly bg: "\u001B[48;5;6m";
        };
        readonly hex: "#008080";
    };
};
export type CSS_COLOR_STYLE = Lowercase<keyof typeof CSS_COLORS>;
export declare const isCSSColor: (value: CSS_COLOR_STYLE | undefined) => value is "default" | "blue" | "red" | "green" | "yellow" | "cyan" | "black" | "white" | "magenta" | "orange" | "light_blue" | "light_green" | "light_red" | "purple" | "gray" | "brown" | "pink" | "teal";
