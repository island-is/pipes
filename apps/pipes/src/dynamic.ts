import { EventEmitter } from "node:events";

export class DynamicPromiseAggregator {
  #promises = new Set<Promise<any>>();
  #eventEmitter = new EventEmitter();
  #isWatching = false;

  addPromise(promise: Promise<any> | Promise<any>[]): void {
    const values = Array.isArray(promise) ? promise : [promise];
    for (const value of values) {
      this.#promises.add(value);
    }
    this.#eventEmitter.emit("newPromiseAdded");
  }

  watch(): Promise<void> {
    this.#isWatching = true;
    return new Promise<void>(async (resolve, reject) => {
      while (this.#isWatching) {
        if (this.#promises.size === 0) {
          await new Promise((resolve) => this.#eventEmitter.once("newPromiseAdded", resolve));
          continue;
        }

        try {
          const promises = [...this.#promises];
          await Promise.all(promises);

          for (const promise of promises) {
            this.#promises.delete(promise);
          }
          if (this.#promises.size === 0) {
            this.#isWatching = false;
            return resolve();
          }
        } catch (error) {
          return reject(error);
        }
      }
    });
  }

  stopWatching(): void {
    this.#isWatching = false;
  }
}
