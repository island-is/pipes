export interface FileOptions {
  prefix: string;
  postfix: string;
  dir: string;
}

export interface DirOptions extends FileOptions {
  unsafeCleanup: boolean;
}
