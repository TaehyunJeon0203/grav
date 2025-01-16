"use strict";
const electron = require("electron");
const path = require("path");
const child_process = require("child_process");
const fs = require("fs");
let mainWindow = null;
const activeProjects = /* @__PURE__ */ new Map();
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile("dist/index.html");
  }
}
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.ipcMain.handle(
  "ide:open",
  async (_, path2, command) => {
    return new Promise((resolve, reject) => {
      child_process.exec(`${command} "${path2}"`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
);
electron.ipcMain.handle(
  "ide:checkStatus",
  async (_, projectId, path2) => {
    if (activeProjects.has(projectId)) {
      clearInterval(activeProjects.get(projectId));
    }
    const intervalId = setInterval(() => {
      child_process.exec(`ps aux | grep "${path2}"`, (error, stdout) => {
        if (!error && stdout.includes(path2)) {
          mainWindow == null ? void 0 : mainWindow.webContents.send("projectTimeUpdate", projectId);
        } else {
          clearInterval(intervalId);
          activeProjects.delete(projectId);
        }
      });
    }, 6e4);
    activeProjects.set(projectId, intervalId);
  }
);
electron.ipcMain.handle("dialog:openDirectory", async () => {
  const result = await electron.dialog.showOpenDialog({
    properties: ["openDirectory"]
  });
  return result.filePaths[0];
});
electron.ipcMain.handle("save-settings", async (_, settings) => {
  const userDataPath = electron.app.getPath("userData");
  const settingsPath = path.join(userDataPath, "settings.json");
  await fs.promises.writeFile(settingsPath, JSON.stringify(settings));
});
electron.ipcMain.handle("load-settings", async () => {
  const userDataPath = electron.app.getPath("userData");
  const settingsPath = path.join(userDataPath, "settings.json");
  try {
    const data = await fs.promises.readFile(settingsPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
});
