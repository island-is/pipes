export const Link = (props, children)=>{
    return {
        type: "Link",
        ...props,
        children
    };
};
