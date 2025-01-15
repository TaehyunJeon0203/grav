import { useState } from "react";
import { Project } from "../../types/project";
import { formatMinutes } from "../../utils/format";
import { openInIde } from "../../utils/project";
import { EditProjectModal } from "../Modal/EditProjectModal";
import {
  PencilIcon,
  TrashIcon,
  StarIcon as StarOutline,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { useProjectStore } from "../../stores/projectStore";
import { getRecentTimeTotal } from "../../utils/time";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { removeProject, updateProject } = useProjectStore();
  const totalMinutes = project.totalTime / 60;
  const recentMinutes = getRecentTimeTotal(project.timeLogs || []);

  const handleOpenClick = async () => {
    await openInIde(project.path);
  };

  const handleDelete = () => {
    if (confirm("정말 이 프로젝트를 삭제하시겠습니까?")) {
      removeProject(project.id);
    }
  };

  const toggleFavorite = () => {
    updateProject(project.id, { isFavorite: !project.isFavorite });
  };

  return (
    <>
      <div className="bg-neutral-800 rounded-lg p-6 hover:bg-neutral-700 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <div className="text-sm space-y-1">
              <p className="text-gray-400">
                합계: {formatMinutes(totalMinutes)}
              </p>
              <p className="text-blue-400">
                지난 2주 동안: {formatMinutes(recentMinutes)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className={`p-1.5 hover:bg-neutral-600 rounded transition-colors ${
                project.isFavorite
                  ? "text-yellow-400 hover:text-yellow-500"
                  : "text-gray-400 hover:text-yellow-400"
              }`}
              title={project.isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
            >
              {project.isFavorite ? (
                <StarSolid className="w-4 h-4" />
              ) : (
                <StarOutline className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-1.5 hover:bg-neutral-600 rounded"
              title="수정"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 hover:bg-neutral-600 rounded text-red-500"
              title="삭제"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenClick}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm"
            >
              Open
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 truncate">{project.path}</p>
      </div>

      <EditProjectModal
        project={project}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};
