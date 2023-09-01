export const createStore = (obj, updateFn, overWritten)=>{
    const values = {};
    // Initialize with undefined
    Object.keys(obj).forEach((e)=>{
        values[e] = undefined;
    });
    const holder = new class {
        #callbacks = new Set();
        update = async ()=>{
            if (updateFn) {
                await updateFn(this);
            }
        };
        constructor(){
            Object.keys(obj).forEach((e)=>{
                this[e] = undefined;
            });
        }
        addCallback = (fn)=>{
            this.#callbacks.add(fn);
            const remove = ()=>{
                this.#callbacks.delete(fn);
            };
            return remove;
        };
    }();
    /** @ts-ignore - We are barbarains here. */ const handler = createHandler(obj, overWritten);
    /** @ts-ignore - We are barbarains here. */ return new Proxy(holder, handler);
};
function createHandler(obj, overWritten) {
    return {
        set: (container, prop, value)=>{
            if (prop === "update") {
                return false;
            }
            if (prop in obj) {
                const ww = overWritten?.(prop);
                if (typeof ww !== "undefined") {
                    return false;
                }
                if (typeof obj[prop] === "function" && "_isPipesCommand" in obj[prop] && typeof value === "function") {
                    obj[prop]._fn = value;
                    return true;
                }
                const newValue = obj[prop] && typeof obj[prop] === "object" && "parse" in obj[prop] && typeof obj[prop].parse === "function" ? obj[prop].parse(value) : value;
                container[prop] = newValue;
                container.update();
                return true;
            }
            return false;
        },
        get: (container, prop)=>{
            if (typeof container[prop] === "undefined") {
                if (typeof obj[prop] === "function" && "_isPipesCommand" in obj[prop]) {
                    // pipes function
                    return obj[prop];
                }
                const ww = overWritten?.(prop);
                if (typeof ww !== "undefined") {
                    return ww;
                }
                return obj[prop] && typeof obj[prop] === "object" && "parse" in obj[prop] && typeof obj[prop].parse === "function" ? obj[prop].parse(undefined) : undefined;
            }
            return container[prop];
        }
    };
}
