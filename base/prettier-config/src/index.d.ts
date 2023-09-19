declare module "@island-is/prettier-config" {
  interface Config {
    bracketSpacing: boolean;
    trailingComma: "all" | "es5";
    singleQuote: boolean;
    printWidth: number;
    tabWidth: number;
    useTabs: boolean;
    semi: boolean;
  }

  const config: Config;
  export = config;
}
