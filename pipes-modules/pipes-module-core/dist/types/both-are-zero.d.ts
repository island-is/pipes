export type bothAreZero<T extends number, X extends number> = T extends 0 ? (X extends 0 ? true : false) : false;
export type ifIsNotZero<T extends number, If, Else> = 0 extends T ? Else : If;
