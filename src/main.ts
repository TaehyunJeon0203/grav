import { app, BrowserWindow, ipcMain, screen } from "electron";
import { spawn, exec, execSync } from "child_process";
import { fileURLToPath } from "url";
import { join } from "path";
import fs from "fs";
import * as path from "path";

let mainWindow: BrowserWindow | null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

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
  Object.keys(projectTimers).forEach((projectPath) => {
    stopProjectTimer(projectPath);
  });
  saveTotalTimerState(totalTimerState);
  saveProjectTimerState();
});

// 창 생성
function createWindow(): void {
  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find(
    (display) => display.bounds.x !== 0 || display.bounds.y !== 0
  );

  if (externalDisplay) {
    const { x, y } = externalDisplay.bounds;
    mainWindow = new BrowserWindow({
      x,
      y,
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

  startTotalTimer(true);
}

// VSCode 실행 여부 확인
function isVSCodeRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    exec("ps aux | grep 'Visual Studio Code' | grep -v grep", (err, stdout) => {
      if (err) {
        console.error("Error checking VSCode process:", err);
        resolve(false);
      } else {
        resolve(stdout.length > 0);
      }
    });
  });
}

// VSCode로 해당 프로젝트가 열려있는지 확인하는 함수
function isProjectOpenInVSCode(projectPath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // lsof 명령어 실행
    exec(`lsof | grep ${projectPath} | grep Code`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing lsof: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Error output from lsof: ${stderr}`);
        reject(new Error(stderr));
        return;
      }

      // 결과가 있는지 확인
      const isOpenInVSCode = stdout.trim().length > 0;
      resolve(isOpenInVSCode);
    });
  });
}

// 전체 타이머 상태 로드 및 저장 함수
const TOTAL_TIMER_FILE_PATH = path.join(
  app.getPath("userData"),
  "total_timer.json"
);
const PROJECT_TIMER_FILE_PATH = path.join(
  app.getPath("userData"),
  "project_timers.json"
);

interface TimerState {
  seconds: number;
}

interface ProjectTimerState {
  [projectPath: string]: {
    seconds: number;
    dailyTimes: { [date: string]: number };
  };
}

let totalTimerState = loadTotalTimerState();
let projectTimerStates: ProjectTimerState = loadProjectTimerStates();

// 전체 타이머 상태 로드
function loadTotalTimerState(): TimerState {
  if (fs.existsSync(TOTAL_TIMER_FILE_PATH)) {
    const fileContent = fs.readFileSync(TOTAL_TIMER_FILE_PATH, "utf-8");
    try {
      return JSON.parse(fileContent) || { seconds: 0 };
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  }
  return { seconds: 0 };
}

// 전체 타이머 상태 저장
function saveTotalTimerState(state: TimerState) {
  fs.writeFileSync(TOTAL_TIMER_FILE_PATH, JSON.stringify(state));
}

// 프로젝트별 타이머 상태 로드
function loadProjectTimerStates(): ProjectTimerState {
  if (fs.existsSync(PROJECT_TIMER_FILE_PATH)) {
    try {
      const fileContent = fs.readFileSync(PROJECT_TIMER_FILE_PATH, "utf-8");
      return JSON.parse(fileContent);
    } catch (error) {
      console.error("프로젝트 타이머를 로드할 수 없습니다:", error);
    }
  }
  return {};
}

// 프로젝트별 타이머 상태 저장
function saveProjectTimerState() {
  fs.writeFileSync(PROJECT_TIMER_FILE_PATH, JSON.stringify(projectTimerStates));
}

// 2주간 작업시간 계산 함수
function getRecentTwoWeeksPlayTime(dailyTimes: {
  [date: string]: number;
}): number {
  const offset = new Date().getTimezoneOffset() * 60000;
  const today = new Date(Date.now() - offset);
  let totalTime = 0;

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    totalTime += dailyTimes[dateString] || 0;
  }
  return totalTime;
}

// 타이머 함수들

let totalTimerInterval: NodeJS.Timeout;
let projectTimers: { [projectPath: string]: NodeJS.Timeout } = {};

// 전체 타이머 시작
function startTotalTimer(initialCheck = false) {
  if (initialCheck) {
    isVSCodeRunning().then((vscodeRunning) => {
      if (mainWindow) {
        mainWindow.webContents.send(
          "update-totalTimer",
          totalTimerState.seconds
        );
      }
    });
  }

  totalTimerInterval = setInterval(async () => {
    const vscodeRunning = await isVSCodeRunning();
    if (vscodeRunning) {
      totalTimerState.seconds++;
      saveTotalTimerState(totalTimerState);
    }

    if (mainWindow) {
      mainWindow.webContents.send("update-totalTimer", totalTimerState.seconds);
    }
  }, 1000);
}

// 전체 타이머 정지
function stopTimer() {
  clearInterval(totalTimerInterval);
}

// 날짜 포맷 함수
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 프로젝트별 타이머 시작
function startProjectTimer(projectPath: string, initialCheck = false) {
  if (!projectTimerStates[projectPath]) {
    projectTimerStates[projectPath] = {
      seconds: 0,
      dailyTimes: {},
    };
  }

  if (initialCheck) {
    // 초기 상태를 클라이언트로 전송
    if (mainWindow) {
      mainWindow.webContents.send("update-project-timer", {
        projectPath,
        seconds: projectTimerStates[projectPath].seconds,
        dailyTimes: projectTimerStates[projectPath].dailyTimes,
        recentTwoWeeksPlayTime: getRecentTwoWeeksPlayTime(
          projectTimerStates[projectPath].dailyTimes
        ),
      });
    }
  }

  const timer = setInterval(async () => {
    const isOpen = await isProjectOpenInVSCode(projectPath);

    if (isOpen) {
      projectTimerStates[projectPath].seconds += 1;
      console.log(
        `Project Path: ${projectPath}, Seconds: ${projectTimerStates[projectPath].seconds}`
      );

      // 일별 시간 업데이트
      const today = formatDate(new Date());
      if (!projectTimerStates[projectPath].dailyTimes[today]) {
        projectTimerStates[projectPath].dailyTimes[today] = 0;
      }
      projectTimerStates[projectPath].dailyTimes[today] += 1;

      console.log(`Project Path: ${projectPath}`);
      console.log(`Updating dailyTimes for ${today}`);
      console.log(
        `Updated dailyTimes: ${JSON.stringify(
          projectTimerStates[projectPath].dailyTimes
        )}`
      );

      saveProjectTimerState();

      if (mainWindow) {
        mainWindow.webContents.send("update-project-timer", {
          projectPath,
          seconds: projectTimerStates[projectPath].seconds || 0,
          dailyTimes: projectTimerStates[projectPath].dailyTimes || {},
          twoWeeksTimes: getRecentTwoWeeksPlayTime(
            projectTimerStates[projectPath].dailyTimes
          ),
        });
      }
    }
  }, 1000);

  projectTimers[projectPath] = timer;
}
// 프로젝트별 타이머 정지
function stopProjectTimer(projectPath: string) {
  if (projectTimers[projectPath]) {
    clearInterval(projectTimers[projectPath]);
    delete projectTimers[projectPath];
  }
}

// IPC 이벤트 핸들러
ipcMain.on("launch-project", (event, projectPath: string) => {
  console.log(`Opening project at: ${projectPath}`);

  const child = spawn(getCodePath(), [projectPath, "--reuse-window"], {
    shell: true,
  });

  startProjectTimer(projectPath);

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
    console.log(`Project at ${projectPath} closed with code ${code}`);
    // VSCode가 열려 있는지 추가 확인
    isProjectOpenInVSCode(projectPath).then((isOpen) => {
      if (!isOpen) {
        stopProjectTimer(projectPath);
      }
    });
  });
});

// VSCode 경로 찾기
function getCodePath() {
  try {
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

    throw new Error(
      "Could not find VSCode executable. Please ensure VSCode is installed."
    );
  }
}
