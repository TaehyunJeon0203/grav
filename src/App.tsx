import { ProjectList } from "./components/Project/ProjectList";
import { Timer } from "./components/Timer/Timer";
import { MainLayout } from "./components/Layout/MainLayout";

function App() {
  return (
    <MainLayout>
      <Timer />
      <ProjectList />
    </MainLayout>
  );
}

export default App;
