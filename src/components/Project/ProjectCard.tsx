import { Project } from "../../types/project";
import { formatMinutes } from "../../utils/format";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const minutes = project.totalTime / 60;

  return (
    <div className="bg-neutral-800 rounded-lg p-6 hover:bg-neutral-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <p className="text-sm text-gray-400">{formatMinutes(minutes)}</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm">
          Open
        </button>
      </div>
      <p className="text-xs text-gray-500 truncate">{project.path}</p>
    </div>
  );
};
