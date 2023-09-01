export const Note = (props, children)=>{
    return {
        type: "Note",
        ...props,
        children
    };
};
