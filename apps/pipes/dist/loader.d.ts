interface LoadContext {
    parentURL?: string | undefined;
}
type LoadFn = (url: string, context: LoadContext, nextLoad: LoadFn) => Promise<{
    source?: string | Buffer | null | undefined;
    shortCircuit: boolean;
    format?: "commonjs" | "module";
}>;
declare const load: LoadFn;

interface ResolveContext {
    parentURL?: string | undefined;
}
type ResolveFn = (url: string, context: ResolveContext, nextResolve: ResolveFn) => Promise<{
    url: string;
    shortCircuit: boolean;
}>;
declare const resolve: ResolveFn;

export { load, resolve };
