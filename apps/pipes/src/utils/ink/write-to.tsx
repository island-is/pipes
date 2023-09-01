import { maskString } from "./mask.js";

const _RENDER_STATE = {
  force_stop: false,
};

export const haltAllRender = (): void => {
  _RENDER_STATE.force_stop = true;
};

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

class WriteToGeneric {
  #locked: boolean = false;
  #lockPromises: Array<() => void> = [];
  #streamWrite: typeof process.stdout.write | typeof process.stderr.write;

  constructor(stream: typeof process.stdout.write | typeof process.stderr.write) {
    this.#streamWrite = stream;
    this.write = this.write.bind(this);
    this.lock = this.lock.bind(this);
  }

  #newLockPromise = () => {
    return new Promise<void>((resolve) => {
      this.#lockPromises.push(resolve);
    });
  };

  #getFirstResolve = (): (() => void) | undefined => {
    return this.#lockPromises.shift();
  };

  async lock(
    fn: (
      write: (msg: string | Uint8Array, encoding?: BufferEncoding | undefined) => Promise<void>,
    ) => Promise<void> | void,
  ): Promise<void> {
    if (this.#locked) {
      await this.#newLockPromise();
    }
    this.#locked = true;
    try {
      await fn(this.#write.bind(this));
    } finally {
      const val = this.#getFirstResolve();
      if (val) {
        val();
      } else {
        this.#locked = false;
      }
    }
  }

  write(
    value: Uint8Array | string,
    encodingOrCb?: BufferEncoding | ((err?: Error) => void),
    _cb?: (err?: Error) => void,
  ): boolean {
    const cb = typeof encodingOrCb === "function" ? encodingOrCb : _cb;
    const encoding = typeof encodingOrCb !== "function" ? encodingOrCb : undefined;

    void this.lock((write) => {
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

  #write(msg: string | Uint8Array, encoding?: BufferEncoding | undefined) {
    return new Promise<void>((resolve) => {
      if (_RENDER_STATE.force_stop) {
        resolve();
        return;
      }
      const _msg = typeof msg === "string" ? msg : Buffer.from(msg).toString(encoding);
      this.#streamWrite(maskString(_msg), () => {
        resolve();
      });
    });
  }
}

export const WriteTo = new WriteToGeneric(originalStdoutWrite);
export const WriteToError = new WriteToGeneric(originalStderrWrite);

// process.stdout.write = WriteTo.write;
// process.stderr.write = WriteToError.write;
