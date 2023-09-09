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

export const addBorder = (lines: string[], css: ComputedCSS, width: number): string[] => {
  const style = css.visibility === false ? BORDER_STYLES["hidden"] : BORDER_STYLES[css.borderStyle || "solid"];

  const marginLeft = css.marginLeft ? " ".repeat(css.marginLeft) : "";
  const marginRight = css.marginRight ? " ".repeat(css.marginRight) : "";
  const widthTops = width + (!css.borderLeft ? 1 : 0) + (!css.borderRight ? 1 : 0);
  const topBorder = !css.borderTop
    ? ""
    : (css.borderLeft ? style.topLeft : "") +
      style.horizontal.repeat(widthTops) +
      (css.borderRight ? style.topRight : "");

  const bottomBorder = !css.borderBottom
    ? ""
    : (css.borderLeft ? style.topLeft : "") +
      style.horizontal.repeat(widthTops) +
      (css.borderRight ? style.topRight : "");

  const borderedLines = lines.map((line) => {
    const left = css.borderLeft ? style.vertical : "";
    const right = css.borderRight ? style.vertical : "";
    return marginLeft + left + line.padEnd(width) + right + marginRight;
  });

  return [topBorder, ...borderedLines, bottomBorder].filter(Boolean);
};
