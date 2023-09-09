export type IDivider = { type: "Divider" };
export const Divider = (props: Omit<IDivider, "type" | "children">): IDivider => {
  return {
    type: "Divider",
    ...props,
  };
};
