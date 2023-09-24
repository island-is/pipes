/**
 * @file Extend type, allowing more options.
 */
export type ExtendType<T extends Record<string, any>> = Record<string, any> & T;
