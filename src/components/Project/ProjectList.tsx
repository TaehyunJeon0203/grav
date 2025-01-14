import { useProjectStore } from "../../stores/projectStore";
import { ProjectCard } from "./ProjectCard";

export const ProjectList = () => {
  const { projects } = useProjectStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">프로젝트 목록</h2>
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
          프로젝트 추가
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};
