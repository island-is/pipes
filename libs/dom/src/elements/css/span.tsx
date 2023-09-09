import { addBorder } from "./border.js";
import { CSS_COLORS } from "./colors.js";
import { computeCSS } from "./css.js";

import type { CSS, ComputedCSS } from "./types.js";

const applyANSIStyle = (text: string, ansiCode: { startTag: string; endTag: string }) => {
  return `${ansiCode.startTag}${text}${ansiCode.endTag}`;
};

function escapeAnsi(line: string) {
  const ansiEscape = new RegExp("(?:\\x9B|\\x1B\\[)[0-?]*[ -/]*[@-~]", "g");
  return line.replace(ansiEscape, "");
}

const splitByWidth = (
  text: string,
  width: number | "auto",
  paddingLeft: number,
  paddingRight: number,
  textAlign: ComputedCSS["textAlign"] = "left",
) => {
  const result = [];
  let currentIndex = 0;
  const usageWidth = width === "auto" ? 0 : Math.max(width - paddingLeft - paddingRight, 0);
  if (usageWidth === 0) {
    return [];
  }
  if (width === "auto") {
    const paddingLeftStr = " ".repeat(paddingLeft);
    const paddingRightStr = " ".repeat(paddingRight);
    return [`${paddingLeftStr}${text}${paddingRightStr}`];
  }
  while (currentIndex < text.length) {
    let lineText = text.slice(currentIndex, currentIndex + usageWidth);
    const paddingLeftStr = " ".repeat(paddingLeft);
    const paddingRightStr = " ".repeat(paddingRight);
    switch (textAlign) {
      case "center":
        const totalSpaces = width - escapeAnsi(lineText).length - paddingRight - paddingLeft;
        const startPadding = Math.floor(totalSpaces / 2);
        const endPadding = totalSpaces - startPadding;
        lineText = " ".repeat(startPadding) + lineText + " ".repeat(endPadding);
        break;
      case "right":
        lineText = " ".repeat(width - lineText.length - paddingRight) + lineText;
        break;
    }
    result.push(`${paddingLeftStr}${lineText}${paddingRightStr}`);
    currentIndex += usageWidth;
  }
  return result;
};

export const span = (text: string, _css: CSS, width: number = process.stdout.columns || 80): string[] => {
  const css = computeCSS(_css, width);
  const borderHeight = (css.borderTop ? 1 : 0) + (css.borderBottom ? 1 : 0);
  const marginHeight = (css.marginTop ? css.marginTop : 0) + (css.marginBottom ? css.marginBottom : 0);
  const paddingHeight = (css.paddingTop ? css.paddingTop : 0) + (css.paddingBottom ? css.paddingBottom : 0);
  const outsideHeight = borderHeight + marginHeight + paddingHeight;
  const marginWidth = (css.marginLeft ?? 0) + (css.marginRight ?? 0);
  const borderWidth = (css.borderLeft ? 1 : 0) + (css.borderRight ? 1 : 0);
  const expectedWidth = css.width ? Math.max(css.width ?? 0 - marginWidth - borderWidth, 0) : "auto";
  let expectedHeight = typeof css.height !== "undefined" ? Math.max(css.height - outsideHeight, 0) : ("auto" as const);
  let marginTopStrArr = Array(css.marginTop ?? 0).fill("");
  let marginBottomStrArr = Array(css.marginBottom ?? 0).fill("");
  const paddingTopStrArr = Array(css.paddingTop ?? 0).fill("");
  const paddingBottomStrArr = Array(css.paddingBottom ?? 0).fill("");
  if (expectedHeight !== "auto") {
    expectedHeight = Math.max(expectedHeight - outsideHeight, 0);
  }
  if (expectedHeight === 0 || css.hidden) {
    return [];
  }

  let lines = text.split("\n").flatMap((line) => {
    return splitByWidth(line, expectedWidth, css.paddingLeft ?? 0, css.paddingRight ?? 0, css.textAlign);
  });
  if (typeof expectedHeight === "number" && lines.length > expectedHeight) {
    lines = lines.splice(0, expectedHeight);
    lines[lines.length - 1] = lines[lines.length - 1]
      .split("")
      .map((e, index, arr) => {
        if (index === arr.length - 1) {
          return "…";
        }
        return e;
      })
      .join("");
  }

  // 4. Add borders
  //let lines = [formattedText];
  /* if (css.border) {
    lines = addBorder(lines, css);
  } */

  if (expectedWidth !== "auto") {
    lines = lines.map((e) => e.padEnd(Math.min(expectedWidth)));
    marginBottomStrArr = marginBottomStrArr.map((e) => e.padEnd(expectedWidth));
    marginTopStrArr = marginTopStrArr.map((e) => e.padEnd(expectedWidth));
  }
  lines = [...paddingTopStrArr, ...lines, ...paddingBottomStrArr];
  const lineLength = lines.reduce((a, b) => Math.max(a, escapeAnsi(b).length), 0);
  /* if (typeof css.width !== "undefined") {
    lines = lines.map((e) => e.padEnd(Math.min(css.width as number, width)));
  } */
  // 2. Apply font styles
  if (css.visibility === true && css.fontStyle) {
    for (const style of css.fontStyle) {
      for (let i = 0; i < lines.length; i++) {
        lines[i] = applyANSIStyle(lines[i].padEnd(lineLength), style.ansi);
      }
    }
  }

  if (css.visibility === true && css.color) {
    for (let i = 0; i < lines.length; i++) {
      lines[i] = applyANSIStyle(lines[i].padEnd(lineLength), {
        startTag: css.color.ansi.fg,
        endTag: CSS_COLORS.DEFAULT.ansi.fg,
      });
    }
  }
  if (css.visibility === true && css.backgroundColor) {
    for (let i = 0; i < lines.length; i++) {
      lines[i] = applyANSIStyle(lines[i], {
        startTag: css.backgroundColor.ansi.bg,
        endTag: CSS_COLORS.DEFAULT.ansi.bg,
      });
    }
  }
  lines = [...marginTopStrArr, ...addBorder(lines, css, lineLength), ...marginBottomStrArr];
  if (!css.visibility) {
    return lines.map((e) => e.split("").fill(" ").join(""));
  }
  return lines;
};
