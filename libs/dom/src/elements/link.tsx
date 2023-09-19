import { Text, Transform } from "@island-is/ink";
import React from "react";
import terminalLink from "terminal-link";

export const Link = ({ url, children }: { children: string; url: string }): React.ReactNode => {
  return (
    <Transform transform={(children) => terminalLink(children, url, { fallback: true })}>
      <Text>{children}</Text>
    </Transform>
  );
};
