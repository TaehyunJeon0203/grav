import { TotalTime } from "./components/TotalTime";
import { ProjectList } from "./components/Project/ProjectList";
import { SettingsButton } from "./components/Settings/SettingsButton";

function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Grav</h1>
        <SettingsButton />
      </div>
      <div className="space-y-8">
        <TotalTime />
        <ProjectList />
      </div>
    </div>
  );
}

export default App;
