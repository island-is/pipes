import { Writable } from "node:stream";

import type { WritableOptions } from "node:stream";

export class PipesStream extends Writable {
  private dataChunks: string[];

  constructor(options?: WritableOptions) {
    super(options);

    // Initialize an array to store data chunks
    this.dataChunks = [];
  }

  _write(chunk: Buffer, encoding: BufferEncoding | undefined, callback: (error?: Error | null) => void): void {
    const utf8String = chunk.toString("utf8");
    this.dataChunks.push(utf8String);
    callback();
  }
  getData(): string[] {
    return this.dataChunks;
  }
}
