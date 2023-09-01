import { autorun, createAtom, makeAutoObservable } from "mobx";
export class MobXStore {
    constructor(){
        makeAutoObservable(this);
    }
}
class AtomMap {
    #atom = new Map();
    get(key) {
        if (!this.#atom.has(key)) {
            const value = createAtom(key);
            this.#atom.set(key, value);
            return value;
        }
        return this.#atom.get(key);
    }
}
const createAtomMap = ()=>new AtomMap();
export function createZodStore(obj, skip = []) {
    return new class {
        /** @ts-expect-error: this is accessed */ #values = {};
        constructor(){
            const observables = createAtomMap();
            const skipped = skip.map(({ key })=>key);
            for (const { key, get, set } of skip){
                // So we can get all keys with Object.keys
                this[key] = undefined;
                Object.defineProperty(this, key, {
                    get,
                    set: set ?? undefined
                });
            }
            for (const key of Object.keys(obj)){
                if (skipped.includes(key)) {
                    continue;
                }
                // So we can get all keys with Object.keys
                this[key] = true;
                Object.defineProperty(this, key, {
                    get: ()=>{
                        observables.get(key).reportObserved();
                        if (typeof this.#values[key] === "undefined") {
                            if (typeof obj[key] === "function") {
                                this.#values[key] = obj[key];
                            } else {
                                this.#values[key] = obj[key].parse(undefined);
                            }
                        }
                        return this.#values[key];
                    },
                    set: (value)=>{
                        if (typeof obj[key] === "function") {
                            observables.get(key).reportChanged();
                            this.#values[key] = obj[key]._wrapper(value);
                            return true;
                        }
                        this.#values[key] = obj[key].parse(value);
                        observables.get(key).reportChanged();
                        return true;
                    }
                });
            }
        }
    }();
}
export const wrapContext = (obj, config, stack = [
    config.appName
])=>{
    const functionParams = Object.entries(obj).filter(([_key, value])=>typeof value === "function");
    const skip = [
        {
            key: "stack",
            get: ()=>stack
        },
        ...functionParams.map(([key, value])=>{
            return {
                key,
                get: ()=>{
                    return (val)=>{
                        const newContext = wrapContext(obj, config, [
                            ...stack,
                            key
                        ]);
                        return value(newContext, config, val);
                    };
                }
            };
        })
    ];
    return new class {
        /** @ts-expect-error: this is accessed */ #values = {};
        constructor(){
            const skipped = skip.map(({ key })=>key);
            for (const { key, get } of skip){
                // So we can get all keys with Object.keys
                this[key] = undefined;
                Object.defineProperty(this, key, {
                    get
                });
            }
            for (const key of Object.keys(obj)){
                if (skipped.includes(key)) {
                    continue;
                }
                // So we can get all keys with Object.keys
                this[key] = true;
                Object.defineProperty(this, key, {
                    get: ()=>{
                        return obj[key];
                    },
                    set: (value)=>{
                        obj[key] = value;
                        return true;
                    }
                });
            }
        }
    }();
};
export const createLockStore = ()=>{
    return new class {
        #atom = createAtomMap();
        #map = new Map();
        #lockKey = (key)=>{
            this.#map.set(key, true);
            this.#atom.get(key).reportChanged();
        };
        #unlock = (key)=>{
            this.#map.set(key, false);
            this.#atom.get(key).reportChanged();
        };
        isLocked(key) {
            this.#atom.get(key).reportObserved();
            return this.#map.has(key) ? this.#map.get(key) === true : false;
        }
        waitForLock(key) {
            return new Promise((resolve)=>{
                const fn = {};
                fn.stopWait = autorun(()=>{
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
        async lock(key, fn) {
            await this.waitForLock(key);
            this.#lockKey(key);
            let value;
            try {
                value = await fn();
            } catch (e) {
                this.#unlock(key);
                throw e;
            }
            this.#unlock(key);
            return value;
        }
    }();
};
export const createZodKeyStore = (type)=>{
    return new class {
        #type;
        #atom = createAtomMap();
        #map = new Map();
        #lock = createLockStore();
        constructor(){
            this.#type = type;
        }
        awaitForAvailability(key) {
            return new Promise((resolve)=>{
                const fn = {};
                fn.stopWaiting = autorun(async ()=>{
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
        async getKey(key) {
            const value = await this.#lock.lock(key, ()=>{
                this.#atom.get(key).reportObserved();
                return !this.#map.has(key) ? null : this.#map.get(key);
            });
            return value;
        }
        async setKey(key, value) {
            await this.#lock.lock(key, ()=>{
                this.#map.set(key, this.#type.parse(value));
                this.#atom.get(key).reportChanged();
            });
        }
        async getOrSet(key, fn) {
            const value = await this.#lock.lock(key, async ()=>{
                if (!this.#map.has(key)) {
                    const newValue = await fn();
                    this.#atom.get(key).reportChanged();
                    this.#map.set(key, newValue);
                    return newValue;
                }
                this.#atom.get(key).reportObserved();
                return this.#map.get(key);
            });
            return value;
        }
    }();
};
const globalstore = {};
const globalLock = createLockStore();
export const createGlobalZodStore = (obj, key)=>{
    return globalLock.lock(key, ()=>{
        if (globalstore[key]) {
            return globalstore[key];
        }
        globalstore[key] = createZodStore(obj);
        return globalstore[key];
    });
};
export const createGlobalZodKeyStore = (obj, key)=>{
    return globalLock.lock(key, ()=>{
        if (globalstore[key]) {
            return globalstore[key];
        }
        globalstore[key] = createZodKeyStore(obj);
        return globalstore[key];
    });
};
