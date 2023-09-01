import { autorun, createAtom, makeAutoObservable } from "mobx";

import type { IAtom } from "mobx";
import type { ZodAny, ZodType, z } from "zod";

export class MobXStore {
  constructor() {
    makeAutoObservable(this);
  }
}

type StoreObj = Record<string, z.ZodType<any> | Function>;

class AtomMap {
  #atom = new Map<string, IAtom>();
  get(key: string): IAtom {
    if (!this.#atom.has(key)) {
      const value = createAtom(key);
      this.#atom.set(key, value);
      return value;
    }
    return this.#atom.get(key) as IAtom;
  }
}
const createAtomMap = () => new AtomMap();

interface Skip<T extends StoreObj, key extends keyof T = keyof T> {
  key: keyof T;
  get: () => T[key] extends z.ZodType<any> ? z.infer<T[key]> : T[key];
  set?: (value: T[key] extends z.ZodType<any> ? z.infer<T[key]> : T[key]) => boolean;
}

type Skips<T extends StoreObj> = Skip<T>[];
type DefaultOutput<T extends StoreObj> = { [K in keyof T]: T[K] extends z.ZodType<any> ? z.infer<T[K]> : T[K] };
export function createZodStore<T extends StoreObj = StoreObj, Output = DefaultOutput<T>>(
  obj: T,
  skip: Skips<T> = [],
): Output {
  return new (class {
    /** @ts-expect-error: this is accessed */
    #values: {
      [K in keyof T]: ZodType<T[K]> | Function;
    } = {};
    constructor() {
      const observables = createAtomMap();
      const skipped = skip.map(({ key }) => key);

      for (const { key, get, set } of skip) {
        // So we can get all keys with Object.keys
        (this as any)[key] = undefined;
        Object.defineProperty(this, key, {
          get,
          set: set ?? undefined,
        });
      }
      for (const key of Object.keys(obj)) {
        if (skipped.includes(key)) {
          continue;
        }
        // So we can get all keys with Object.keys
        (this as any)[key] = true;
        Object.defineProperty(this, key, {
          get: () => {
            observables.get(key).reportObserved();
            if (typeof this.#values[key] === "undefined") {
              if (typeof obj[key] === "function") {
                this.#values[key as keyof T] = obj[key];
              } else {
                this.#values[key as keyof T] = (obj[key] as ZodAny).parse(undefined);
              }
            }
            return this.#values[key];
          },
          set: (value) => {
            if (typeof obj[key] === "function") {
              observables.get(key).reportChanged();
              this.#values[key as keyof T] = (obj[key] as any)._wrapper(value);
              return true;
            }
            this.#values[key as keyof T] = (obj[key] as ZodAny).parse(value);
            observables.get(key).reportChanged();
            return true;
          },
        });
      }
    }
  })() as unknown as Output;
}

type DefaultWrapOutput<T extends StoreObj> = {
  [K in keyof T]: T[K] extends z.ZodType<any>
    ? z.infer<T[K]>
    : T[K] extends (arg1: any, arg2: any, ...arg: infer Arg) => infer X
    ? Arg["length"] extends 0 | undefined
      ? () => X
      : (arg: Arg[0]) => X
    : T[K] extends (arg1: any, arg2: any) => infer X
    ? () => X
    : T[K];
};

export const wrapContext = <T extends Record<string, any>, Output = DefaultWrapOutput<T>>(
  obj: T,
  config: Record<string, any>,
  stack: string[] = [config.appName],
): Output => {
  const functionParams = Object.entries(obj).filter(([_key, value]) => typeof value === "function");
  const skip = [
    { key: "stack", get: () => stack },
    ...functionParams.map(([key, value]) => {
      return {
        key,
        get: () => {
          return (val: any) => {
            const newContext = wrapContext(obj, config, [...stack, key]);
            return (value as Function)(newContext, config, val);
          };
        },
      };
    }),
  ];
  return new (class {
    /** @ts-expect-error: this is accessed */
    #values: { [K in keyof T]: valueToZod<T[K]> } = {};
    constructor() {
      const skipped = skip.map(({ key }) => key);

      for (const { key, get } of skip) {
        // So we can get all keys with Object.keys
        (this as any)[key] = undefined;
        Object.defineProperty(this, key, {
          get,
        });
      }
      for (const key of Object.keys(obj)) {
        if (skipped.includes(key)) {
          continue;
        }
        // So we can get all keys with Object.keys
        (this as any)[key] = true;
        Object.defineProperty(this, key, {
          get: () => {
            return obj[key];
          },
          set: (value) => {
            obj[key as keyof T] = value;
            return true;
          },
        });
      }
    }
  })() as unknown as Output;
};

export const createLockStore = (): {
  isLocked: (key: string) => boolean;
  waitForLock: (key: string) => Promise<void>;
  lock<T extends () => any>(key: string, fn: T): Promise<Awaited<ReturnType<T>>>;
} => {
  return new (class {
    #atom = createAtomMap();
    #map = new Map<string, boolean>();
    #lockKey = (key: string) => {
      this.#map.set(key, true);
      this.#atom.get(key).reportChanged();
    };
    #unlock = (key: string) => {
      this.#map.set(key, false);
      this.#atom.get(key).reportChanged();
    };
    isLocked(key: string): boolean {
      this.#atom.get(key).reportObserved();
      return this.#map.has(key) ? this.#map.get(key) === true : false;
    }
    waitForLock(key: string): Promise<void> {
      return new Promise<void>((resolve) => {
        const fn: Record<string, () => void> = {};
        fn.stopWait = autorun(() => {
          this.#atom.get(key).reportObserved();
          const isLocked = this.isLocked(key);
          if (!isLocked) {
            resolve();
            if (!fn.stopWait) {
              return;
            }
            fn.stopWait();
          }
        });
      });
    }
    async lock<T extends () => any>(key: string, fn: T): Promise<Awaited<ReturnType<T>>> {
      await this.waitForLock(key);
      this.#lockKey(key);
      let value: Awaited<ReturnType<T>>;
      try {
        value = await fn();
      } catch (e) {
        this.#unlock(key);
        throw e;
      }

      this.#unlock(key);
      return value;
    }
  })();
};

export const createZodKeyStore = <T extends z.ZodType<any>>(
  type: T,
): {
  awaitForAvailability(key: string): Promise<z.infer<T>>;
  getKey(key: string): Promise<z.infer<T> | null>;
  setKey(key: string, value: z.infer<T>): Promise<void>;
  getOrSet(key: string, fn: () => Promise<z.infer<T>> | z.infer<T>): Promise<z.infer<T>>;
} => {
  return new (class {
    #type: T;
    #atom = createAtomMap();
    #map = new Map<string, z.infer<T>>();
    #lock = createLockStore();
    constructor() {
      this.#type = type;
    }
    awaitForAvailability(key: string): Promise<z.infer<T>> {
      return new Promise((resolve) => {
        const fn: Record<string, () => void> = {};
        fn.stopWaiting = autorun(async () => {
          this.#atom.get(key).reportObserved();
          const value = await this.getKey(key);
          if (value !== null) {
            resolve(value);
            if (!fn.stopWaiting) {
              return;
            }
            fn.stopWaiting();
          }
        });
      });
    }
    async getKey(key: string): Promise<z.infer<T> | null> {
      const value = await this.#lock.lock(key, () => {
        this.#atom.get(key).reportObserved();
        return !this.#map.has(key) ? null : this.#map.get(key);
      });
      return value;
    }
    async setKey(key: string, value: z.infer<T>): Promise<void> {
      await this.#lock.lock(key, () => {
        this.#map.set(key, this.#type.parse(value));
        this.#atom.get(key).reportChanged();
      });
    }
    async getOrSet(key: string, fn: () => Promise<z.infer<T>> | z.infer<T>): Promise<z.infer<T>> {
      const value = await this.#lock.lock(key, async () => {
        if (!this.#map.has(key)) {
          const newValue = await fn();
          this.#atom.get(key).reportChanged();
          this.#map.set(key, newValue);
          return newValue;
        }
        this.#atom.get(key).reportObserved();
        return this.#map.get(key);
      });
      return value as T | null;
    }
  })();
};

const globalstore = {} as any;
const globalLock = createLockStore();

export const createGlobalZodStore = <T extends StoreObj>(
  obj: T,
  key: string,
): Promise<ReturnType<typeof createZodStore<T>>> => {
  return globalLock.lock(key, () => {
    if (globalstore[key]) {
      return globalstore[key] as ReturnType<typeof createZodStore<T>>;
    }

    globalstore[key] = createZodStore<T>(obj);
    return globalstore[key] as ReturnType<typeof createZodStore<T>>;
  });
};

export const createGlobalZodKeyStore = <T extends z.ZodType<any>>(
  obj: T,
  key: string,
): Promise<ReturnType<typeof createZodKeyStore<T>>> => {
  return globalLock.lock(key, () => {
    if (globalstore[key]) {
      return globalstore[key] as ReturnType<typeof createZodKeyStore<T>>;
    }
    globalstore[key] = createZodKeyStore<T>(obj);
    return globalstore[key] as ReturnType<typeof createZodKeyStore<T>>;
  });
};
