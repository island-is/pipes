export const getScreenWidth = (): number => {
  const isTest = import.meta.url.includes(".spec.");
  return isTest ? 80 : Math.min(process.stdout.columns ?? 80, 80);
};
