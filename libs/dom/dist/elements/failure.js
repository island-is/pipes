export const Failure = (props, children)=>{
    return {
        type: "Failure",
        ...props,
        children
    };
};
