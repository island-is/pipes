import { applyANSIStyle, escapeAnsi } from "./ansi-escape.js";
import { addBorder } from "./border.js";
import { CSS_COLORS } from "./colors.js";
import { computeCSS } from "./css.js";
import { splitByHeight, splitByWidth } from "./split-helpers.js";

import type { CSS } from "./types.js";

export const span = (text: string, _css: CSS, width: number = process.stdout.columns || 80): string[] => {
  const css = computeCSS(_css, width);
  const borderHeight = (css.borderTop ? 1 : 0) + (css.borderBottom ? 1 : 0);
  const marginHeight = (css.marginTop ? css.marginTop : 0) + (css.marginBottom ? css.marginBottom : 0);
  const paddingHeight = (css.paddingTop ? css.paddingTop : 0) + (css.paddingBottom ? css.paddingBottom : 0);
  const outsideHeight = borderHeight + marginHeight + paddingHeight;
  const marginWidth = (css.marginLeft ?? 0) + (css.marginRight ?? 0);
  const borderWidth = (css.borderLeft ? 1 : 0) + (css.borderRight ? 1 : 0);
  const paddingLeft = css.paddingLeft ?? 0;
  const expectedWidth = css.width ? css.width - marginWidth - borderWidth - 1 : "auto";
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
    lines = splitByHeight(lines, expectedHeight);
  }

  if (expectedWidth !== "auto") {
    marginBottomStrArr = marginBottomStrArr.map((e) => e.padEnd(expectedWidth));
    marginTopStrArr = marginTopStrArr.map((e) => e.padEnd(expectedWidth));
  }
  lines = [...paddingTopStrArr, ...lines, ...paddingBottomStrArr];
  const lineLength = lines.reduce((a, b) => Math.max(a, escapeAnsi(b).length), 0);

  // Apply font styles
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
  const realBorderWidth =
    typeof expectedWidth === "number" ? expectedWidth : lines.reduce((a, b) => Math.max(escapeAnsi(b).length, a), 0);
  lines = [...marginTopStrArr, ...addBorder(lines, css, realBorderWidth), ...marginBottomStrArr];
  if (!css.visibility) {
    return lines.map((e) => e.split("").fill(" ").join(""));
  }
  return lines;
};
