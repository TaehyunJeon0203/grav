"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  // 디렉토리 선택 다이얼로그
  openDirectory: async () => {
    return electron.ipcRenderer.invoke("dialog:openDirectory");
  },
  // IDE 관련
  openInIde: async (path, command) => {
    return electron.ipcRenderer.invoke("ide:open", path, command);
  },
  // IDE 상태 체크 시작
  checkIdeStatus: async (projectId, path) => {
    return electron.ipcRenderer.invoke("ide:checkStatus", projectId, path);
  },
  // 설정 관련
  saveSettings: async (settings) => {
    return electron.ipcRenderer.invoke("save-settings", settings);
  },
  loadSettings: async () => {
    return electron.ipcRenderer.invoke("load-settings");
  },
  // 이벤트 리스너
  onTimeUpdate: (callback) => {
    const wrappedCallback = (_, projectId) => callback(projectId);
    electron.ipcRenderer.on("projectTimeUpdate", wrappedCallback);
    return wrappedCallback;
  },
  removeTimeUpdateListener: (wrappedCallback) => {
    electron.ipcRenderer.removeListener("projectTimeUpdate", wrappedCallback);
  }
});
