export const sourceFile = [
  'import { createPipe } from "@island.is/pipes-core";',
  "",
  "await createPipe(({ createPipesCore }) => {",
  "  const mainContext = createPipesCore();",
  "  mainContext.addScript(() => {",
  "    console.log(`Hello world`);",
  "  });",
  "  return [mainContext];",
  "});",
  "",
].join("\n");
