/**
 * @file Remove extra fields.
 */
export type Exact<T> = { [K in keyof T]: T[K] };
