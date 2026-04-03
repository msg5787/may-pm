import { useState } from "react";
import { mock_projects, mock_tasks } from "./mockData.js";
import Navbar from "./components/Navbar.jsx";
import ProjectList from "./components/ProjectList.jsx";
import TaskPanel from "./components/TaskPanel.jsx";

function App() {
    const [selected_project_id, set_selected_project_id] = useState(mock_projects[0]?._id || null);

    const selected_project = mock_projects.find(
        (project) => project._id === selected_project_id
    );

    const filtered_tasks = mock_tasks.filter(
        (task) => task.project_id === selected_project_id
    );

    return (
        <div className="bg-light min-vh-100">
            <Navbar />

            <div className="container-fluid py-4">
                <div className="row g-4">
                    <div className="col-md-4 col-lg-3">
                        <ProjectList
                            projects={mock_projects}
                            selected_project_id={selected_project_id}
                            set_selected_project_id={set_selected_project_id}
                        />
                    </div>

                    <div className="col-md-8 col-lg-9">
                        <TaskPanel
                            project={selected_project}
                            tasks={filtered_tasks}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;