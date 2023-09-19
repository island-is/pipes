import { Box, useWidthContext } from "@island-is/ink";
import React from "react";

import type { ReactNode } from "react";

export type IDivider = { type: "Divider" };
export const Divider = (_props: Omit<IDivider, "type">): ReactNode => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return RenderDivider();
};

const RenderDivider = () => {
  const totalWidths: number = useWidthContext();
  return (
    <Box
      width={totalWidths}
      minWidth={totalWidths}
      height={1}
      borderTop={false}
      borderLeft={false}
      borderRight={false}
      borderBottom={true}
      borderStyle={"single"}
    />
  );
};
