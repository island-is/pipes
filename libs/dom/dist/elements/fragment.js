export const Fragment = (props, ...children)=>{
    return {
        type: "Fragment",
        ...props,
        children
    };
};
