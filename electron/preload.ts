import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
  // 여기에 나중에 필요한 기능들을 추가할 예정
});
