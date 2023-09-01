export const Success = (props, children)=>{
    return {
        type: "Success",
        ...props,
        children
    };
};
