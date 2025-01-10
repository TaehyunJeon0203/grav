import { create } from "zustand";
import { Project } from "../types/project";

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  currentProject: null,
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  removeProject: (id) =>
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),
  setCurrentProject: (project) => set({ currentProject: project }),
}));
