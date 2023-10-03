const masks = new Set<string | number>();
const getMasks = () => Array.from(masks);
export const maskValue = "****";

export const maskString = (value: string | number): string => {
  let str = `${value}`;
  getMasks().forEach((item) => {
    str = str.replaceAll(`${item}`, maskValue);
  });
  return str;
};

export const setMask = (value: (string | number) | (string | number)[]): void => {
  if (Array.isArray(value)) {
    value.filter(Boolean).forEach((item) => setMask(item));
    return;
  }
  masks.add(value);
};
