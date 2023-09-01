export const Error = (props, children)=>{
    return {
        type: "Error",
        ...props,
        children
    };
};
