import { createGlobalZodKeyStore, z } from "@island.is/pipes-core";

import type {
  ConstraintsResult,
  ImportResult,
  LintResult,
  RunnerError,
  SWCResult,
  TestResult,
  TypescriptResult,
} from "@island.is/scripts";
import type { RollupResult } from "@island.is/scripts/src/lib/build-with-rollup.js";

const globalTestReport = await createGlobalZodKeyStore(z.custom<any>(), "GLOBAL_REPORT");
const globalTestReportKeys = ["buildDevImage", "buildOrder", "workspaceTest", "build", "lint", "test"] as const;
type globalTestReport = (typeof globalTestReportKeys)[number];

type BuildDevImage = { type: "BuildDevImage" } & ({ status: "Success" } | { status: "Error"; error?: unknown });

type BuildOrder = { type: "BuildOrder" } & ({ status: "Success" } | { status: "Error"; error?: unknown });

export const testReport = {
  buildDevImage: {
    get: (): Promise<BuildDevImage> => {
      return globalTestReport.awaitForAvailability("buildDevImage") as Promise<BuildDevImage>;
    },
    set: (value: BuildDevImage): Promise<void> => {
      return globalTestReport.setKey("buildDevImage", value);
    },
  },

  workspaceTest: {
    get: (): Promise<(RunnerError | ConstraintsResult)[]> => {
      return globalTestReport.awaitForAvailability("workspaceTest") as Promise<(RunnerError | ConstraintsResult)[]>;
    },
    set: (value: (RunnerError | ConstraintsResult)[]): Promise<void> => {
      return globalTestReport.setKey("workspaceTest", value);
    },
  },
  buildOrder: {
    get: (): Promise<BuildOrder> => {
      return globalTestReport.awaitForAvailability("buildOrder") as Promise<BuildOrder>;
    },
    set: (value: BuildOrder): Promise<void> => {
      return globalTestReport.setKey("buildOrder", value);
    },
  },
  build: {
    get: (): Promise<(TypescriptResult | SWCResult | RollupResult | RunnerError)[]> => {
      return globalTestReport.awaitForAvailability("build") as Promise<
        (TypescriptResult | SWCResult | RollupResult | RunnerError)[]
      >;
    },
    set: (value: (TypescriptResult | SWCResult | RollupResult | RunnerError)[]): Promise<void> => {
      return globalTestReport.setKey("build", value);
    },
  },
  lint: {
    get: (): Promise<(RunnerError | LintResult)[]> => {
      return globalTestReport.awaitForAvailability("lint") as Promise<(RunnerError | LintResult)[]>;
    },
    set: (value: (RunnerError | LintResult)[]): Promise<void> => {
      return globalTestReport.setKey("lint", value);
    },
  },
  test: {
    get: (): Promise<(TestResult | ImportResult | TypescriptResult)[]> => {
      return globalTestReport.awaitForAvailability("test") as Promise<(TestResult | ImportResult | TypescriptResult)[]>;
    },
    set: (value: (TestResult | ImportResult | TypescriptResult)[]): Promise<void> => {
      return globalTestReport.setKey("test", value);
    },
  },
};
