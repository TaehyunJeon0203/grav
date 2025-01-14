export interface IElectronAPI {
  openDirectory: () => Promise<string>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
