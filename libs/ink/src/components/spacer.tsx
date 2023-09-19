import React from "react";

import Box from "./box.js";

/**
 * A flexible space that expands along the major axis of its containing layout.
 * It's useful as a shortcut for filling all the available spaces between elements.
 */
export default function Spacer(): React.JSX.Element {
  return <Box flexGrow={1} />;
}
