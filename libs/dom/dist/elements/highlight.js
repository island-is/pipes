export const Highlight = (props, children)=>{
    return {
        type: "Highlight",
        ...props,
        children
    };
};
