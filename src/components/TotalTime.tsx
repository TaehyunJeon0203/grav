import { useProjectStore } from "../stores/projectStore";
import { formatMinutes } from "../utils/format";
import { GlobalHeatmap } from "./Heatmap/GlobalHeatmap";

export const TotalTime = () => {
  const { projects } = useProjectStore();
  const totalMinutes = projects.reduce(
    (sum, project) => sum + project.totalTime / 60,
    0
  );

  return (
    <div className="bg-neutral-800 rounded-lg p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">전체 작업 시간</h2>
          <p className="text-4xl font-bold">{formatMinutes(totalMinutes)}</p>
        </div>
        <div className="ml-12">
          <GlobalHeatmap />
        </div>
      </div>
    </div>
  );
};
