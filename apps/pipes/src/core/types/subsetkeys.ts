export type SubsetKeys<T, U extends T> = {
  [K in keyof U]: K extends keyof T ? T[K] : never;
};
