export const formatMinutes = (minutes: number): string => {
  return `${minutes % 1 === 0 ? Math.floor(minutes) : minutes.toFixed(1)}분`;
};
