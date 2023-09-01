import { z } from "zod";
import type { ZodDefault, util } from "zod";
interface DefaultProps {
    env?: string;
    variables?: string;
    arg?: {
        short?: string | undefined;
        long: string;
        positional?: boolean;
    };
}
declare module "zod" {
    interface ZodType<Output = any, Def extends z.ZodTypeDef = z.ZodTypeDef, Input = Output> {
        default(def?: util.noUndefined<Input>, options?: DefaultProps): ZodDefault<this>;
        default(def?: () => util.noUndefined<Input>, options?: DefaultProps): ZodDefault<this>;
    }
}
export * from "zod";
export * from "./observer.js";
