import { escapeAnsi, splitIntoSegments } from "./ansi-escape.js";

import type { ComputedCSS } from "./types.js";

export function splitByHeight(text: string[], height: number): string[] {
  const values: string[] = [];
  if (height === 0) {
    return [];
  }
  for (let i = 0; i < text.length; i++) {
    if (i < height) {
      values.push(text[i]);
    } else {
      const segments = splitIntoSegments(text[i]);
      for (const segment of segments) {
        if (segment.isAnsi) {
          values[values.length - 1] += segment.text.trim();
        }
      }
    }
  }
  return values;
}

export function splitByWidth(
  text: string,
  width: number | "auto",
  paddingLeft: number,
  paddingRight: number,
  textAlign: ComputedCSS["textAlign"] = "left",
): string[] {
  if (width === "auto") {
    return [text];
  }
  if (text.length <= width) {
    return [text];
  }
  const result: string[] = [];
  const segments = splitIntoSegments(text);
  let currentLine = "";
  let currentWidth = 0;
  const ansiStack: string[] = [];
  for (const segment of segments) {
    if (segment.isAnsi) {
      currentLine += segment.text;
      ansiStack.push(segment.text);
      continue;
    }

    for (const char of segment.text) {
      if (currentWidth === width) {
        result.push(currentLine.trim());
        currentLine = "";
        currentWidth = 0;
      }

      currentLine += char;
      currentWidth++;
    }
  }

  if (currentLine) {
    result.push(currentLine.trim());
  }

  for (let i = 0; i < result.length; i++) {
    const line = result[i];
    const paddingLeftStr = " ".repeat(paddingLeft);
    const paddingRightStr = " ".repeat(paddingRight);
    let adjustedLine = line;

    switch (textAlign) {
      case "center":
        const totalSpaces = width - escapeAnsi(line).length - paddingRight - paddingLeft;
        const startPadding = Math.floor(totalSpaces / 2);
        const endPadding = totalSpaces - startPadding;
        adjustedLine = " ".repeat(startPadding) + line + " ".repeat(endPadding);
        break;
      case "right":
        adjustedLine = " ".repeat(width - escapeAnsi(line).length - paddingRight) + line;
        break;
    }

    result[i] = `${paddingLeftStr}${adjustedLine}${paddingRightStr}`;
  }

  return result;
}
