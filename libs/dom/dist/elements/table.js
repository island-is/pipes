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
