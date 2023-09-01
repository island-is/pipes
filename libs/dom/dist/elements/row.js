export const Row = (props, children)=>{
    return {
        type: "Row",
        ...props,
        children
    };
};
