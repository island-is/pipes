import { createContext, useContext } from "react";

export const getWidth = (): number => {
  const isTest = import.meta.url.includes(".spec.");
  return isTest ? 80 : Math.min(process.stdout.columns ?? 80, 80);
};

export const WidthContext = createContext<number>(getWidth());
export const useWidthContext = (): number => {
  return useContext(WidthContext);
};
