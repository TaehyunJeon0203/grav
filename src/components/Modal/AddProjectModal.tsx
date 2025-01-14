import { useState } from "react";
import { useProjectStore } from "../../stores/projectStore";
import { v4 as uuidv4 } from "uuid";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProjectModal = ({ isOpen, onClose }: AddProjectModalProps) => {
  const [projectName, setProjectName] = useState("");
  const [projectPath, setProjectPath] = useState("");
  const { addProject } = useProjectStore();

  const handleSelectDirectory = async () => {
    try {
      // 웹 개발 중에는 임시 경로 사용
      const path = window.electron?.openDirectory
        ? await window.electron.openDirectory()
        : "/fake/path/for/development";

      if (path) {
        setProjectPath(path);
        // 폴더 이름을 기본 프로젝트 이름으로 설정
        const folderName = path.split(/[/\\]/).pop();
        if (folderName && !projectName) {
          setProjectName(folderName);
        }
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !projectPath) return;

    const newProject = {
      id: uuidv4(),
      name: projectName,
      path: projectPath,
      totalTime: 0,
    };

    addProject(newProject);
    setProjectName("");
    setProjectPath("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">새 프로젝트 추가</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <button
              type="button"
              onClick={handleSelectDirectory}
              className="w-full bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded text-left"
            >
              {projectPath || "프로젝트 폴더 선택"}
            </button>
          </div>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="프로젝트 이름"
            className="w-full bg-neutral-700 rounded px-3 py-2 mb-4"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded hover:bg-neutral-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!projectPath || !projectName.trim()}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
