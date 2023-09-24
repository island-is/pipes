import process from "node:process";

const _RENDER_STATE = {
  force_stop: false,
};

export const haltAllRender = (): void => {
  _RENDER_STATE.force_stop = true;
};

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

  static lock = async (
    fn: (write: (msg: string, output?: "stdout" | "stderr") => void) => Promise<void> | void,
  ): Promise<void> => {
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
  };

  static #write(msg: string, output: "stdout" | "stderr" = "stdout") {
    if (_RENDER_STATE.force_stop) {
      return;
    }
    process[output].write(msg);
  }
}
