export interface TimeLog {
  date: string;
  minutes: number;
  projectId: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  totalTime: number;
  isFavorite: boolean;
  timeLogs: TimeLog[];
  createdAt: Date;
  updatedAt: Date;
}
