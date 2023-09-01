export const Log = (props, children)=>{
    return {
        type: "Log",
        ...props,
        children
    };
};
