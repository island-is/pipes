export const Warning = (props, children)=>{
    return {
        type: "Warning",
        ...props,
        children
    };
};
