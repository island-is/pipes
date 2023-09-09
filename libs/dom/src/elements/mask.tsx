export type IMask = { type: "Mask"; values: string[] | string };
export const Mask = (props: Omit<IMask, "type" | "children">): { props: IMask } => {
  return {
    props: {
      type: "Mask",
      ...props,
    },
  };
};
