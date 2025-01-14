export interface IElectronAPI {
  openDirectory: () => Promise<string>;
  openInIde: (path: string, command: string) => Promise<void>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
