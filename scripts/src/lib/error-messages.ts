export type STATUS_SUCCESS = "Success";
export type STATUS_ERROR = "Error";
export type UNKNOWN_ERROR = "Unknown error";
export type CONSOLE = {
  stdout: string;
  stderr: string;
};

/** TEST */
export type TestType = "Test";
export type TestResult = {
  type: TestType;
  workspace: string;
} & (
  | { status: STATUS_SUCCESS; name: string }
  | { status: STATUS_ERROR; name: string; file: string }
  | { status: STATUS_ERROR; message: UNKNOWN_ERROR }
);
/** IMPORT */
export type ImportType = "Import";
export type ImportErrorMessage =
  | "Type should be in dev dependencies"
  | "Packages should be in dev and peer dependencies.";
export type ImportError = { message: ImportErrorMessage; package: string } | { message: UNKNOWN_ERROR };
export type ImportResult = {
  type: ImportType;
  workspace: string;
} & ({ status: STATUS_SUCCESS } | { status: STATUS_ERROR; error: ImportError });
/** SWC */
export type SWCType = "SWC";
export type SWCError = { message: UNKNOWN_ERROR } | { message: string; line: number; character: number };
export type SWCResult = {
  type: SWCType;
  workspace: string;
} & ({ status: STATUS_SUCCESS; file: string } | { status: STATUS_ERROR; error: SWCError });

/** Typescript */
export type TypescriptType = "Typescript";
export type TypescriptError = { message: UNKNOWN_ERROR } | { message: string; line: number; character: number };
export type TypescriptResult = {
  type: TypescriptType;
  mode: "test" | "build";
  workspace: string;
} & ({ status: STATUS_SUCCESS; file: string } | { status: STATUS_ERROR; file: string; error: TypescriptError });

/** Lint */
export type LintType = "Lint";
export type LintError =
  | { message: UNKNOWN_ERROR; detail?: string }
  | { message: string; line: number; character: number };
export type LintResult = {
  type: LintType;
  workspace: string;
} & ({ status: STATUS_SUCCESS; file: string } | { status: STATUS_ERROR; file: string; error: LintError });

/* constraints */
export type ConstraintsType = "Constraints";
export type ConstraintsError = { message: UNKNOWN_ERROR } | { message: CONSOLE };
export type ConstraintsResult = {
  type: ConstraintsType;
} & ({ status: STATUS_SUCCESS; message: CONSOLE } | { status: STATUS_ERROR; error: ConstraintsError });
