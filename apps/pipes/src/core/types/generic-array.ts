type ArrayItem<T extends any[]> = T[number];
export type GenericArray<T extends any[]> = Array<ArrayItem<T>>;
