import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { TimerStore } from "../types/timer";

export const useTimerStore = create<TimerStore>()(
  immer((set) => ({
    isRunning: false,
    startTime: null,
    currentTime: 0,
    projectId: null,

    startTimer: (projectId: string) =>
      set((state: TimerStore) => {
        state.isRunning = true;
        state.startTime = new Date();
        state.projectId = projectId;
      }),

    stopTimer: () =>
      set((state: TimerStore) => {
        state.isRunning = false;
        // 여기서 프로젝트의 totalTime을 업데이트하는 로직 추가 가능
      }),

    resetTimer: () =>
      set((state: TimerStore) => {
        state.isRunning = false;
        state.startTime = null;
        state.currentTime = 0;
        state.projectId = null;
      }),
  }))
);
