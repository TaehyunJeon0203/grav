import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { exec } from "child_process";
import fs from "fs";

let mainWindow: BrowserWindow | null = null;
const activeProjects = new Map();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile("dist/index.html");
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IDE로 프로젝트 열기
ipcMain.handle(
  "ide:open",
  async (_, path: string, command: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      exec(`${command} "${path}"`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
);

// IDE 상태 체크 시작
ipcMain.handle(
  "ide:checkStatus",
  async (_, projectId: string, path: string): Promise<void> => {
    // 이미 실행 중인 프로세스가 있다면 종료
    if (activeProjects.has(projectId)) {
      clearInterval(activeProjects.get(projectId));
    }

    // 프로세스 상태 주기적 체크
    const intervalId = setInterval(() => {
      exec(`ps aux | grep "${path}"`, (error, stdout) => {
        if (!error && stdout.includes(path)) {
          // IDE가 실행 중이면 시간 업데이트
          mainWindow?.webContents.send("projectTimeUpdate", projectId);
        } else {
          // IDE가 종료되면 interval 정리
          clearInterval(intervalId);
          activeProjects.delete(projectId);
        }
      });
    }, 60000); // 1분마다 체크

    activeProjects.set(projectId, intervalId);
  }
);

// 디렉토리 선택 다이얼로그
ipcMain.handle("dialog:openDirectory", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.filePaths[0];
});

// 설정 저장/불러오기
ipcMain.handle("save-settings", async (_, settings) => {
  const userDataPath = app.getPath("userData");
  const settingsPath = path.join(userDataPath, "settings.json");
  await fs.promises.writeFile(settingsPath, JSON.stringify(settings));
});

ipcMain.handle("load-settings", async () => {
  const userDataPath = app.getPath("userData");
  const settingsPath = path.join(userDataPath, "settings.json");

  try {
    const data = await fs.promises.readFile(settingsPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
});
