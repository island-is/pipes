export const getScreenWidth = (): number => {
  const isTest = import.meta.url.includes(".spec.");
  return isTest ? 120 : Math.min(process.stdout.columns ?? 120, 120);
};
