export const Container = (props, children)=>{
    return {
        type: "Container",
        ...props,
        children
    };
};
