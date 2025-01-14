export interface TimeLog {
  date: string; // ISO 문자열 형식 (YYYY-MM-DD)
  minutes: number;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  totalTime: number;
  isFavorite: boolean;
  timeLogs: TimeLog[];
}
