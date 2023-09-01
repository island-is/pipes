import type { ComputedCSS } from "./types.js";

const BORDER_STYLES = {
  solid: {
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
    horizontal: "─",
    vertical: "│",
  },
  dotted: {
    topLeft: "+",
    topRight: "+",
    bottomLeft: "+",
    bottomRight: "+",
    horizontal: ".",
    vertical: ":",
  },
  dashed: {
    topLeft: "+",
    topRight: "+",
    bottomLeft: "+",
    bottomRight: "+",
    horizontal: "-",
    vertical: "|",
  },
  hidden: {
    topLeft: " ",
    topRight: " ",
    bottomLeft: " ",
    bottomRight: " ",
    horizontal: " ",
    vertical: " ",
  },
  double: {
    topLeft: "╔",
    topRight: "╗",
    bottomLeft: "╚",
    bottomRight: "╝",
    horizontal: "═",
    vertical: "║",
  },
};

export const addBorder = (lines: string[], css: ComputedCSS): string[] => {
  const style = css.visibility === false ? BORDER_STYLES["hidden"] : BORDER_STYLES[css.borderStyle || "solid"];
  const horizontalBorder = style.horizontal.repeat(lines[0].length);
  const topBorder = css.borderTop ? style.topLeft + horizontalBorder + style.topRight : "";
  const bottomBorder = css.borderBottom ? style.bottomLeft + horizontalBorder + style.bottomRight : "";

  const borderedLines = lines.map((line) => {
    const left = css.borderLeft ? style.vertical : "";
    const right = css.borderRight ? style.vertical : "";
    return left + line + right;
  });
  return [topBorder, ...borderedLines, bottomBorder].filter(Boolean);
};
