export type IMask = { type: "Mask"; values: string[] | string };
export const Mask = (props: Omit<IMask, "type">): IMask => {
  return {
    type: "Mask",
    ...props,
  };
};
