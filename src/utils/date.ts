export const getDatesInRange = (start: Date, end: Date): string[] => {
  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const getColorIntensity = (minutes: number): string => {
  if (minutes === 0) return "bg-neutral-700";
  if (minutes < 60) return "bg-emerald-900";
  if (minutes < 120) return "bg-emerald-700";
  if (minutes < 240) return "bg-emerald-500";
  return "bg-emerald-300";
};
