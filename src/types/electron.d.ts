export interface IElectronAPI {
  openDirectory: () => Promise<string>;
  openInIde: (path: string, command: string) => Promise<void>;
  checkIdeStatus: (projectId: string, path: string) => Promise<void>;
  onTimeUpdate: (callback: (projectId: string) => void) => any;
  removeTimeUpdateListener: (callback: any) => void;
  saveSettings: (settings: any) => Promise<void>;
  loadSettings: () => Promise<any>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
