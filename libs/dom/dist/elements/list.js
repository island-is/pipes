export const List = (props, children = [])=>{
    return {
        type: "List",
        ...props,
        children
    };
};
export const ListItem = (props, children)=>{
    return {
        type: "ListItem",
        ...props,
        children
    };
};
