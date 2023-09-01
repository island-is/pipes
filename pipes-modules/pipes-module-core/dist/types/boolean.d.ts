export type isTrueOnly<T> = [T] extends [true] ? true : false;
export type isFalseOnly<T> = [T] extends [false] ? true : false;
export type isTrueAndFalse<T, X = isTrueOnly<T>, Y = isFalseOnly<T>> = T extends boolean ? [X, Y] extends [false, false] ? true : false : false;
