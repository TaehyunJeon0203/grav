export const formatMinutes = (minutes: number): string => {
  const hours = minutes / 60;
  return `${hours % 1 === 0 ? Math.floor(hours) : hours.toFixed(1)}시간`;
};
