export interface TimerStore {
  isRunning: boolean;
  startTime: Date | null;
  currentTime: number;
  projectId: string | null;

  startTimer: (projectId: string) => void;
  stopTimer: () => void;
  resetTimer: () => void;
}
