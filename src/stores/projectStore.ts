import { create } from "zustand";
import { Project } from "../types/project";

interface ProjectStore {
  projects: Project[];
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  getProjectById: (id: string) => Project | undefined;
  getTotalTime: () => number;
}

const loadProjects = (): Project[] => {
  // 기존 데이터 초기화를 위해 주석 해제 후 한 번 실행
  // localStorage.removeItem("projects");

  const saved = localStorage.getItem("projects");
  if (saved) {
    return JSON.parse(saved);
  }

  // 테스트 프로젝트 생성
  const testProject: Project = {
    id: "test-1",
    name: "Test Project",
    path: "/test/path",
    totalTime: 0,
    isFavorite: false,
    timeLogs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 3일 전 특별 케이스 (3.4시간)
  const specialDate = new Date(today);
  specialDate.setDate(today.getDate() - 3);
  testProject.timeLogs.push({
    date: specialDate.toISOString().split("T")[0],
    minutes: 204, // 3.4시간
    projectId: testProject.id,
  });
  testProject.totalTime += 204 * 60;

  // 최근 2주간 (2시간/일, 3일 전 제외)
  for (let i = 0; i < 14; i++) {
    if (i === 3) continue; // 3일 전은 이미 처리했으므로 스킵

    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // 주말은 제외
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    testProject.timeLogs.push({
      date: date.toISOString().split("T")[0],
      minutes: 120, // 2시간
      projectId: testProject.id,
    });
    testProject.totalTime += 120 * 60;
  }

  // 그 이전 1주일 중 4일간 8시간 작업 (22~28일 전)
  const workDays = [22, 23, 25, 26];
  workDays.forEach((daysAgo) => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    testProject.timeLogs.push({
      date: date.toISOString().split("T")[0],
      minutes: 480, // 8시간
      projectId: testProject.id,
    });
    testProject.totalTime += 480 * 60;
  });

  const projects = [testProject];
  localStorage.setItem("projects", JSON.stringify(projects)); // 테스트 데이터도 저장
  return projects;
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: loadProjects(),

  addProject: (project) =>
    set((state) => {
      const projects = [...state.projects, project];
      localStorage.setItem("projects", JSON.stringify(projects));
      return { projects };
    }),

  removeProject: (id) =>
    set((state) => {
      const projects = state.projects.filter((p) => p.id !== id);
      localStorage.setItem("projects", JSON.stringify(projects));
      return { projects };
    }),

  updateProject: (id, updates) =>
    set((state) => {
      const projects = state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      localStorage.setItem("projects", JSON.stringify(projects));
      return { projects };
    }),

  getProjectById: (id) => get().projects.find((p) => p.id === id),

  getTotalTime: () =>
    get().projects.reduce((sum, p) => sum + p.totalTime / 60, 0),
}));
