import { useEffect, useState } from "react";
import * as bootstrap from "bootstrap";

import Navbar from "./components/Navbar.jsx";
import ProjectList from "./components/ProjectList.jsx";
import TaskPanel from "./components/TaskPanel.jsx";

function App() {
    const [projects, set_projects] = useState([]);
    const [selected_project_id, set_selected_project_id] = useState(null);
    const [tasks, set_tasks] = useState([]);

    const [new_project_name, set_new_project_name] = useState("");

    useEffect(() => {
        fetch_projects();
    }, []);

    useEffect(() => {
        fetch_tasks(selected_project_id);
    }, [selected_project_id]);

    const fetch_projects = async () => {
        try {
            const response = await fetch("http://localhost:5001/api/projects");
            const data = await response.json();

            set_projects(data);

            if (data.length > 0) {
                set_selected_project_id(data[0]._id);
            } else {
                set_selected_project_id(null);
            }
        }
        catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    };

    const fetch_tasks = async (project_id) => {
        if (!project_id) {
            set_tasks([]);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/projects/${project_id}/tasks`);
            const data = await response.json();
            set_tasks(data);
        }
        catch (error) {
            console.error("Failed to fetch tasks:", error);
            set_tasks([]);
        }
    };

    const handle_create_project = async (e) => {
        e.preventDefault();

        if (!new_project_name.trim())
            return;

        try {
            const response = await fetch("http://localhost:5001/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: new_project_name.trim(),
                    description: ""
                })
            });

            const new_project = await response.json();

            if (!response.ok) {
                throw new Error(new_project.message || "Failed to create project");
            }

            set_projects((prev) => [new_project, ...prev]);
            set_selected_project_id(new_project._id);
            set_new_project_name("");

            const modal_element = document.getElementById("createProjectModal");
            const modal_instance = bootstrap.Modal.getInstance(modal_element);
            if (modal_instance) {
                modal_instance.hide();
            }
        }
        catch (error) {
            console.error("Failed to create project:", error);
        }
    };

    const selected_project = projects.find(
        (project) => project._id === selected_project_id
    );

    return (
        <div className="bg-light min-vh-100">
            <Navbar />

           <div className="container-fluid py-4">
                <div className="row g-4">
                    <div className="col-md-3 col-lg-3">
                        <ProjectList
                            projects={projects}
                            selected_project_id={selected_project_id}
                            set_selected_project_id={set_selected_project_id}
                        />
                    </div>

                   <div className="col-md-9 col-lg-9">
                        <TaskPanel
                            project={selected_project}
                            tasks={tasks}
                            onTaskCreated={fetch_tasks}
                        />
                    </div>
                </div>
            </div>

            <div className="modal fade" id="createProjectModal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <form onSubmit={handle_create_project}>
                            <div className="modal-header">
                                <h5 className="modal-title">Create Project</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Project name"
                                    value={new_project_name}
                                    onChange={(e) => set_new_project_name(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;