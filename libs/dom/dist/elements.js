export const Group = (props, ...children)=>{
    return {
        type: "Group",
        ...props,
        children
    };
};
export const Fragment = (props, ...children)=>{
    return {
        type: "Fragment",
        ...props,
        children
    };
};
export const Success = (props, children)=>{
    return {
        type: "Success",
        ...props,
        children
    };
};
export const Link = (props, children)=>{
    return {
        type: "Link",
        ...props,
        children
    };
};
export const Container = (props, children)=>{
    return {
        type: "Container",
        ...props,
        children
    };
};
export const Row = (props, children)=>{
    return {
        type: "Row",
        ...props,
        children
    };
};
export const Failure = (props, children)=>{
    return {
        type: "Failure",
        ...props,
        children
    };
};
export const Error = (props, children)=>{
    return {
        type: "Error",
        ...props,
        children
    };
};
export const Info = (props, children)=>{
    return {
        type: "Info",
        ...props,
        children
    };
};
export const Log = (props, children)=>{
    return {
        type: "Log",
        ...props,
        children
    };
};
export const Table = (props, children = [])=>{
    return {
        type: "Table",
        ...props,
        children
    };
};
export const TableHeadings = (props, children = [])=>{
    return {
        type: "TableHeadings",
        ...props,
        children
    };
};
export const TableRow = (props, children = [])=>{
    return {
        type: "TableRow",
        ...props,
        children
    };
};
export const TableCell = (props, children)=>{
    return {
        type: "TableCell",
        ...props,
        children
    };
};
export const Title = (props, children)=>{
    return {
        type: "Title",
        ...props,
        children
    };
};
export const Subtitle = (props, children)=>{
    return {
        type: "Subtitle",
        ...props,
        children
    };
};
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
export const Divider = (props)=>{
    return {
        type: "Divider",
        ...props
    };
};
export const Highlight = (props, children)=>{
    return {
        type: "Highlight",
        ...props,
        children
    };
};
export const Timestamp = (props)=>{
    return {
        type: "Timestamp",
        ...props
    };
};
export const Badge = (props, children)=>{
    return {
        type: "Badge",
        ...props,
        children
    };
};
export const Text = (props)=>{
    return {
        type: "Text",
        ...props
    };
};
export const Note = (props, children)=>{
    return {
        type: "Note",
        ...props,
        children
    };
};
export const Warning = (props, children)=>{
    return {
        type: "Warning",
        ...props,
        children
    };
};
export const Code = (props)=>{
    return {
        type: "Code",
        ...props
    };
};
export const Dialog = (props)=>{
    return {
        type: "Dialog",
        ...props
    };
};
export const Mask = (props)=>{
    return {
        type: "Mask",
        ...props
    };
};
