export const getLast14Days = () => {
  const days: string[] = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split("T")[0]);
  }

  return days;
};

export const getRecentTimeTotal = (timeLogs: TimeLog[]) => {
  const last14Days = getLast14Days();
  return timeLogs
    .filter((log) => last14Days.includes(log.date))
    .reduce((sum, log) => sum + log.minutes, 0);
};
