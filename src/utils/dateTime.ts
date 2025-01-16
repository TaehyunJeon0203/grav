import { TimeLog } from "../types/project";

// 날짜 포맷 관련
export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const formatDateToKorean = (date: Date | string): string => {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
};

// 날짜 범위 관련
export const getDatesInRange = (start: Date, end: Date): string[] => {
  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const getLast14Days = (): string[] => {
  const days: string[] = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(formatDate(date));
  }

  return days;
};

// 시간 계산 관련
export const getRecentTimeTotal = (timeLogs: TimeLog[]): number => {
  const last14Days = getLast14Days();
  return timeLogs
    .filter((log) => last14Days.includes(log.date))
    .reduce((sum, log) => sum + log.minutes, 0);
};

export const getColorIntensity = (minutes: number): string => {
  if (minutes === 0) return "bg-neutral-700";
  if (minutes < 60) return "bg-emerald-900";
  if (minutes < 120) return "bg-emerald-700";
  if (minutes < 240) return "bg-emerald-500";
  return "bg-emerald-300";
};

// 날짜 비교 관련
export const isSameDay = (
  date1: Date | string,
  date2: Date | string
): boolean => {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// 날짜 조작 관련
export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

// 시간 포맷 관련
export const formatMinutes = (minutes: number): string => {
  const hours = minutes / 60;
  return `${hours % 1 === 0 ? Math.floor(hours) : hours.toFixed(1)}시간`;
};

// 주/월 관련
export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const isWeekend = (date: Date | string): boolean => {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDay();
  return day === 0 || day === 6;
};
