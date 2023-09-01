export type IDivider = { type: "Divider" };
export const Divider = (props: Omit<IDivider, "type">): IDivider => {
  return {
    type: "Divider",
    ...props,
  };
};
