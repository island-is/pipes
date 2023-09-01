declare const NeverSymbol: unique symbol;
export type EmptyObject = {
    [NeverSymbol]?: never;
};
export {};
