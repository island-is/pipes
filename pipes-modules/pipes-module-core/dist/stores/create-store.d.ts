export declare const createStore: <Output extends {
    [key: string]: any;
} = {
    [key: string]: any;
}, Zod extends Record<string, any> = any, UpdateFn extends (values: Output) => PromiseLike<void> = (values: Output) => PromiseLike<void>, overWritten extends (key: string) => undefined | any = (key: string) => undefined | any>(obj: Zod, updateFn: UpdateFn | null | undefined, overWritten?: overWritten | undefined) => {
    update: () => {};
    addCallback: () => () => void;
} & Output extends infer T ? T extends {
    update: () => {};
    addCallback: () => () => void;
} & Output ? T extends Output ? {
    update: () => {};
    addCallback: () => () => void;
} & Output : never : never : never;
