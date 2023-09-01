export const Group = (props, ...children)=>{
    return {
        type: "Group",
        ...props,
        children
    };
};
