export function PipesJSXFactory(type, props, ...children) {
    if (type === null) {
        return {
            type: "Fragment",
            children: children.length ? children : null
        };
    }
    if (typeof type === "string") {
        return type;
    }
    if (type && typeof type === "function") {
        const value = type(props, children);
        return value;
    }
    throw new Error("Invalid component passed to PipesJSXFactory");
}
export * from "./elements/elements.js";
