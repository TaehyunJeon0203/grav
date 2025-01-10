import { useProjectStore } from "@/stores/projectStore";

export const ProjectList = () => {
  const { projects, removeProject } = useProjectStore();

  return (
    <div className="grid gap-4 p-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="p-4 bg-card rounded-lg hover:bg-card-hover"
        >
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <p className="text-sm text-gray-400">{project.path}</p>
          <button
            onClick={() => removeProject(project.id)}
            className="text-red-500 hover:text-red-600"
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  );
};
