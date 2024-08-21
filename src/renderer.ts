const { ipcRenderer } = require("electron");

// 프로젝트 관리
interface Project {
  name: string;
  path: string;
  totalTime: number;
  dailyTimes: { [data: string]: number };
  twoWeeksTimes: number;
}

// 프로젝트를 로컬스토리지에 저장
function saveProjects(projects: Project[]): void {
  localStorage.setItem("projects", JSON.stringify(projects));
}

// 프로젝트를 로컬스토리지에서 로드
function loadProjects(): Project[] {
  const savedProjects = localStorage.getItem("projects");
  const projects = savedProjects ? JSON.parse(savedProjects) : [];

  return projects.map((project: Project) => ({
    ...project,
    totalTime: project.totalTime || 0,
    dailyTimes: project.dailyTimes || {},
  }));
}

// 프로젝트 렌더링
function renderProjects(projects: Project[]): void {
  const projectsContainer = document.getElementById("projects");

  if (!projectsContainer) return;

  projectsContainer.innerHTML = "";

  projects.forEach((project) => {
    const projectElement = document.createElement("span");
    projectElement.classList.add(
      "projectElement",
      "flex",
      "flex-col",
      "w-36",
      "h-56",
      "bg-gradient-to-b",
      "from-gray-400",
      "to-gray-800",
      "items-center",
      "card"
    );

    projectElement.dataset.path = project.path; // 데이터 속성으로 경로 저장

    const projectName = document.createElement("span");
    projectName.classList.add("mb-2");
    projectName.textContent = `${project.name}`;

    const totalTime = formatTimeInHours(project.totalTime);
    const twoWeeksTimes = formatTimeInHours(project.twoWeeksTimes);

    const timeInfo = document.createElement("span");
    timeInfo.innerHTML = `<span class="text-neutral-300">작업 시간</span><br>지난 2주간: ${twoWeeksTimes}<br>합계: ${totalTime}`;
    timeInfo.classList.add(
      "absolute",
      "top-16",
      "left-4",
      "text-neutral-400",
      "text-sm",
      "tracking-normal",
      "text-left"
    );

    const launchButton = document.createElement("button");
    launchButton.classList.add("launch-button");
    const iconSpan = document.createElement("span");
    iconSpan.textContent = "▶️";

    launchButton.appendChild(iconSpan);
    launchButton.addEventListener("click", () => {
      ipcRenderer.send("launch-project", project.path);
    });

    projectElement.appendChild(projectName);
    projectElement.appendChild(launchButton);
    projectElement.appendChild(timeInfo);
    projectsContainer.appendChild(projectElement);
  });
}

let projects: Project[] = loadProjects();
renderProjects(projects);

const addProjectArea = document.getElementById(
  "addProjectArea"
) as HTMLDivElement;
const contextMenu = document.getElementById("contextMenu") as HTMLDivElement;

// 추가 프로젝트 버튼 클릭 시
document.getElementById("addProjectOpen")?.addEventListener("click", () => {
  addProjectArea.classList.remove("hidden");
});

document.getElementById("addProject")?.addEventListener("click", () => {
  const projectNameInput = document.getElementById(
    "projectName"
  ) as HTMLInputElement | null;
  const projectPathInput = document.getElementById(
    "projectPath"
  ) as HTMLInputElement | null;

  if (projectNameInput && projectPathInput) {
    const projectName = projectNameInput.value.trim();
    const projectPath = projectPathInput.value.trim();

    if (projectName && projectPath) {
      const newProject: Project = {
        name: projectName,
        path: projectPath,
        totalTime: 0,
        dailyTimes: {},
        twoWeeksTimes: 0,
      };

      projects.push(newProject);
      saveProjects(projects);
      renderProjects(projects);

      projectNameInput.value = "";
      projectPathInput.value = "";
      addProjectArea.classList.add("hidden");
    } else {
      alert("프로젝트 이름과 경로를 입력하세요.");
    }
  } else {
    console.error("Project name or path input elements not found.");
  }
});

// 프로젝트 삭제 우클릭 메뉴
document.addEventListener("contextmenu", (event) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains("projectElement")) {
    event.preventDefault();

    const { clientX: mouseX, clientY: mouseY } = event as MouseEvent;
    contextMenu.style.left = `${mouseX}px`;
    contextMenu.style.top = `${mouseY}px`;
    contextMenu.classList.remove("hidden");

    const selectedProjectPath = target.dataset.path;
    contextMenu.dataset.path = selectedProjectPath || "";
  }
});

document.getElementById("deleteProject")?.addEventListener("click", () => {
  const selectedProjectPath = contextMenu.dataset.path;
  if (!selectedProjectPath) {
    alert("Select a project to delete.");
    return;
  }

  const projectToDelete = projects.find(
    (project) => project.path === selectedProjectPath
  );
  if (!projectToDelete) {
    alert("Project not found.");
    return;
  }

  if (confirm(`정말 ${projectToDelete.name} 프로젝트를 삭제하시겠습니까?`)) {
    projects = projects.filter(
      (project) => project.path !== selectedProjectPath
    );

    saveProjects(projects);
    renderProjects(projects);
  }

  contextMenu.classList.add("hidden");
});

// 컨텍스트 메뉴 및 추가 프로젝트 영역 숨기는 함수
document.addEventListener("click", (event) => {
  if (!contextMenu.contains(event.target as Node)) {
    contextMenu.classList.add("hidden");
  }
  if (
    !addProjectArea.contains(event.target as Node) &&
    !document.getElementById("addProjectOpen")?.contains(event.target as Node)
  ) {
    addProjectArea.classList.add("hidden");
  }
});

// 타이머

// 2주간 작업시간 계산 함수
function getRecentTwoWeeksPlayTime(project: Project): number {
  const today = new Date();
  let totalTime = 0;

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    totalTime += project.dailyTimes[dateString] || 0;
  }

  return totalTime;
}

function formatTimeInHours(seconds: number): string {
  const minutes = seconds / 60;
  const hours = minutes / 60;

  if (seconds == 0) {
    return `0분`;
  } else if (hours >= 1) {
    return `${hours.toFixed(1)}시간`;
  } else {
    return `${minutes.toFixed(0)}분`;
  }
}
const timerDisplay = document.getElementById("timerDisplay");

// 전체 타이머 업데이트 리스너
ipcRenderer.on("update-totalTimer", (event, seconds) => {
  if (timerDisplay) {
    timerDisplay.textContent = formatTimeInHours(seconds);
  }
});

// 프로젝트별 타이머 업데이트 리스너
ipcRenderer.on(
  "update-project-timer",
  (event, { projectPath, seconds, dailyTimes, twoWeeksTimes }) => {
    const project = projects.find((proj) => proj.path === projectPath);
    if (project) {
      project.totalTime = seconds;
      project.dailyTimes = dailyTimes;
      project.twoWeeksTimes = twoWeeksTimes;
      saveProjects(projects);
      renderProjects(projects);
    }
  }
);
