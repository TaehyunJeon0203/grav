import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Project } from "../types/project";

// 테스트용 임시 데이터
const mockProjects: Project[] = [
  {
    id: "1",
    name: "React 프로젝트",
    path: "/path/to/react",
    totalTime: 7210, // 2시간
  },
  {
    id: "2",
    name: "Node.js 백엔드",
    path: "/path/to/node",
    totalTime: 10800, // 3시간
  },
  {
    id: "3",
    name: "Flutter 앱",
    path: "/path/to/flutter",
    totalTime: 3600, // 1시간
  },
];

interface ProjectStore {
  projects: Project[];
  addProject: (project: Project) => void;
  updateProjectTime: (id: string, seconds: number) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: mockProjects, // 초기값으로 목업 데이터 사용
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      updateProjectTime: (id, seconds) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, totalTime: p.totalTime + seconds } : p
          ),
        })),
    }),
    {
      name: "project-storage",
    }
  )
);
