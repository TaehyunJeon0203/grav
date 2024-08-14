import { app, BrowserWindow, ipcMain, screen } from "electron";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { join } from "path";
import { exec, execSync } from "child_process";
import fs from "fs";
import * as path from "path";

let mainWindow: BrowserWindow | null;
let intervalId: NodeJS.Timeout;
const TIMER_FILE_PATH = path.join(app.getPath("userData"), "timer.json");

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

function createWindow(): void {
  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find(
    (display) => display.bounds.x !== 0 || display.bounds.y !== 0
  );
  if (externalDisplay) {
    const { x, y } = externalDisplay.bounds;
    mainWindow = new BrowserWindow({
      x: x, // 외부 모니터에 창을 띄우는 설정
      y: y,
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  } else {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  }
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  startTimer(true);

  function getCodePath() {
    try {
      // 'which code'가 실패할 수 있으므로 여러 경로를 확인
      const codePath = execSync("which code").toString().trim();
      if (fs.existsSync(codePath)) {
        return codePath;
      } else {
        throw new Error("code command not found");
      }
    } catch (error) {
      console.error(
        "Could not find code command path, falling back to default:",
        error
      );
      const fallbackPaths = [
        "/usr/local/bin/code",
        "/opt/homebrew/bin/code", // M1 Mac의 기본 경로
        "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code",
      ];

      for (const fallbackPath of fallbackPaths) {
        if (fs.existsSync(fallbackPath)) {
          return fallbackPath;
        }
      }

      // 모든 경로가 실패할 경우 사용자에게 에러 메시지 전달
      throw new Error(
        "Could not find VSCode executable. Please ensure VSCode is installed."
      );
    }
  }
  // 프로젝트 오픈
  ipcMain.on("launch-project", (event, projectPath) => {
    console.log(`Opening project at: ${projectPath}`);
    console.log(getCodePath());

    const child = spawn(getCodePath(), [projectPath, "--reuse-window"], {
      shell: true,
    });

    child.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on("error", (error) => {
      console.error(`error: ${error.message}`);
    });

    child.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  stopTimer();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("before-quit", () => {
  saveTimerState(timerState);
});

// 타이머
interface TimerState {
  seconds: number;
}

function isVSCodeRunning(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    exec(
      "ps aux | grep 'Visual Studio Code' | grep -v grep",
      (err: Error | null, stdout: string, stderr: string) => {
        if (err) {
          console.error("Error checking VSCode process:", err);
          resolve(false);
          return;
        }
        resolve(stdout.length > 0);
      }
    );
  });
}

function saveTimerState(state: TimerState) {
  fs.writeFileSync(TIMER_FILE_PATH, JSON.stringify(state));
}

function loadTimerState() {
  if (fs.existsSync(TIMER_FILE_PATH)) {
    const fileContent = fs.readFileSync(TIMER_FILE_PATH, "utf-8");

    if (fileContent.trim() === "") {
      // 파일이 비어 있으면 기본 값을 반환
      console.log("Timer JSON file is empty, returning default state.");
      return { seconds: 0 };
    }

    try {
      return JSON.parse(fileContent);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return { seconds: 0 }; // 기본 값 반환
    }
  }
  return { seconds: 0 }; // 파일이 없을 경우 기본 값 반환
}

let timerState = loadTimerState();

function startTimer(initialCheck = false) {
  if (initialCheck) {
    isVSCodeRunning().then((vscodeRunning) => {
      if (mainWindow) {
        // VSCode가 실행 중이 아니더라도 타이머 값을 표시
        mainWindow.webContents.send("update-timer", timerState.seconds);
      }
    });
  }

  intervalId = setInterval(async () => {
    const vscodeRunning = await isVSCodeRunning();
    if (vscodeRunning) {
      timerState.seconds++;
      saveTimerState(timerState);
    }

    if (mainWindow) {
      mainWindow.webContents.send("update-timer", timerState.seconds);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(intervalId);
}
