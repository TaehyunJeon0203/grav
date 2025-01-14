import { TotalTime } from "./components/TotalTime";
import { ProjectList } from "./components/Project/ProjectList";

function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-8">Grav</h1>
      <div className="space-y-8">
        <TotalTime />
        <ProjectList />
      </div>
    </div>
  );
}

export default App;
