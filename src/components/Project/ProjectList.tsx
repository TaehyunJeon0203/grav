import { useState } from "react";
import { useProjectStore } from "../../stores/projectStore";
import { ProjectCard } from "./ProjectCard";
import { AddProjectModal } from "../Modal/AddProjectModal";

export const ProjectList = () => {
  const { projects } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 즐겨찾기 순으로 정렬
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.isFavorite === b.isFavorite) {
      return 0; // 즐겨찾기 상태가 같으면 순서 유지
    }
    return a.isFavorite ? -1 : 1; // 즐겨찾기된 항목이 위로
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">프로젝트 목록</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
        >
          프로젝트 추가
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sortedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
