export const ansiEscape = new RegExp("(?:\\x9B|\\x1B\\[)[0-?]*[ -/]*[@-~]", "g");

export const applyANSIStyle = (text: string, ansiCode: { startTag: string; endTag: string }): string => {
  return `${ansiCode.startTag}${text}${ansiCode.endTag}`;
};
export function escapeAnsi(line: string): string {
  return line.replace(ansiEscape, "");
}

export type Segment = { text: string; isAnsi: boolean };

export function splitIntoSegments(input: string): Segment[] {
  const ansiRegex = /\u001b\[[0-9;]*m/g;
  let lastIndex = 0;
  let match;
  const segments: Segment[] = [];

  while ((match = ansiRegex.exec(input))) {
    if (match.index !== lastIndex) {
      segments.push({
        text: input.slice(lastIndex, match.index),
        isAnsi: false,
      });
    }
    segments.push({ text: match[0], isAnsi: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex !== input.length) {
    segments.push({
      text: input.slice(lastIndex),
      isAnsi: false,
    });
  }

  return segments;
}
