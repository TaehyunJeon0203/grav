import { contextBridge, ipcRenderer } from "electron";

// Electron IPC 통신을 위한 API 노출
contextBridge.exposeInMainWorld("electron", {
  // 디렉토리 선택 다이얼로그
  openDirectory: async () => {
    return ipcRenderer.invoke("dialog:openDirectory");
  },

  // IDE 관련
  openInIde: async (path: string, command: string) => {
    return ipcRenderer.invoke("ide:open", path, command);
  },

  // IDE 상태 체크 시작
  checkIdeStatus: async (projectId: string, path: string) => {
    return ipcRenderer.invoke("ide:checkStatus", projectId, path);
  },

  // 설정 관련
  saveSettings: async (settings: any) => {
    return ipcRenderer.invoke("save-settings", settings);
  },

  loadSettings: async () => {
    return ipcRenderer.invoke("load-settings");
  },

  // 이벤트 리스너
  onTimeUpdate: (callback: (projectId: string) => void) => {
    const wrappedCallback = (_: any, projectId: string) => callback(projectId);
    ipcRenderer.on("projectTimeUpdate", wrappedCallback);
    return wrappedCallback; // 나중에 제거할 때 사용
  },

  removeTimeUpdateListener: (wrappedCallback: any) => {
    ipcRenderer.removeListener("projectTimeUpdate", wrappedCallback);
  },
});

// TypeScript 타입 정의
declare global {
  interface Window {
    electron: {
      openDirectory: () => Promise<string | undefined>;
      openInIde: (path: string, command: string) => Promise<void>;
      checkIdeStatus: (projectId: string, path: string) => Promise<void>;
      saveSettings: (settings: any) => Promise<void>;
      loadSettings: () => Promise<any>;
      onTimeUpdate: (callback: (projectId: string) => void) => void;
      removeTimeUpdateListener: (callback: (projectId: string) => void) => void;
    };
  }
}
