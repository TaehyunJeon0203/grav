import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IDE, IDEType, SUPPORTED_IDES } from "../types/ide";

interface SettingsStore {
  selectedIdeId: IDEType;
  setSelectedIdeId: (id: IDEType) => void;
  getSelectedIde: () => IDE;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      selectedIdeId: "vscode",
      setSelectedIdeId: (id) => set({ selectedIdeId: id }),
      getSelectedIde: () =>
        SUPPORTED_IDES.find((ide) => ide.id === get().selectedIdeId) ||
        SUPPORTED_IDES[0],
    }),
    {
      name: "settings-storage",
    }
  )
);
