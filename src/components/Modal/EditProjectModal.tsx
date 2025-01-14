import { useState } from "react";
import { useProjectStore } from "../../stores/projectStore";
import { Project } from "../../types/project";

interface EditProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const EditProjectModal = ({
  project,
  isOpen,
  onClose,
}: EditProjectModalProps) => {
  const [projectName, setProjectName] = useState(project.name);
  const [projectPath, setProjectPath] = useState(project.path);
  const { updateProject } = useProjectStore();

  const handleSelectDirectory = async () => {
    try {
      const path = window.electron?.openDirectory
        ? await window.electron.openDirectory()
        : "/fake/path/for/development";

      if (path) {
        setProjectPath(path);
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !projectPath) return;

    updateProject(project.id, {
      name: projectName,
      path: projectPath,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">프로젝트 수정</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <button
              type="button"
              onClick={handleSelectDirectory}
              className="w-full bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded text-left"
            >
              {projectPath}
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
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
