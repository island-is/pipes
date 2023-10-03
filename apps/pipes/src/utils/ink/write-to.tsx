import { maskString } from "./mask.js";

const _RENDER_STATE = {
  force_stop: false,
};

export const haltAllRender = (): void => {
  _RENDER_STATE.force_stop = true;
};

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const _originalStderrWrite = process.stderr.write.bind(process.stderr);

export class WriteTo {
  static #locked: boolean = false;
  static #lockPromises: Array<() => void> = [];

  static #newLockPromise = () => {
    const value = new Promise<void>((resolve) => {
      this.#lockPromises.push(resolve);
    });
    return value;
  };

  static #getFirstResolve = (): (() => void) | undefined => {
    const val = this.#lockPromises.shift();
    return val;
  };

  static async lock(
    fn: (
      write: (msg: string | Uint8Array, encoding?: BufferEncoding | undefined) => Promise<void>,
    ) => Promise<void> | void,
  ): Promise<void> {
    if (this.#locked) {
      await this.#newLockPromise();
    }
    this.#locked = true;
    try {
      await fn(this.#write);
    } finally {
      const val = this.#getFirstResolve();
      if (val) {
        val();
      } else {
        this.#locked = false;
      }
    }
  }
  static write(buffer: Uint8Array | string, cb?: (err?: Error) => void): boolean;
  static write(str: Uint8Array | string, encoding?: BufferEncoding, cb?: (err?: Error) => void): boolean;
  static write(
    value: Uint8Array | string,
    encodingOrCb?: BufferEncoding | ((err?: Error) => void),
    _cb?: (err?: Error) => void,
  ): boolean {
    const cb = typeof encodingOrCb === "function" ? encodingOrCb : _cb;
    const encoding = typeof encodingOrCb !== "function" ? encodingOrCb : undefined;
    void WriteTo.lock((write) => {
      return write(value, encoding);
    })
      .then(() => {
        if (cb) {
          cb();
        }
      })
      .catch((e) => {
        if (cb) {
          cb(e);
        }
      });
    return true;
  }
  static #write(msg: string | Uint8Array, encoding?: BufferEncoding | undefined) {
    return new Promise<void>((resolve) => {
      if (_RENDER_STATE.force_stop) {
        resolve();
        return;
      }
      const _msg = typeof msg === "string" ? msg : Buffer.from(msg).toString(encoding);
      originalStdoutWrite(maskString(_msg), () => {
        resolve();
        return;
      });
    });
  }
}

process.stdout.write = WriteTo.write;
process.stderr.write = WriteTo.write;
