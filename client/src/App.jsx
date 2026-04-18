import { useEffect, useState } from "react";
import * as bootstrap from "bootstrap";

import Navbar from "./components/Navbar.jsx";
import ProjectList from "./components/ProjectList.jsx";
import TaskPanel from "./components/TaskPanel.jsx";

function App() {
    const get_local_date_key = (value) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const get_initial_theme = () => {
        const saved_theme = localStorage.getItem("theme");

        if (saved_theme === "light" || saved_theme === "dark") {
            return saved_theme;
        }

        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    };

    const [projects, set_projects] = useState([]);
    const [selected_project_id, set_selected_project_id] = useState(null);
    const [all_tasks, set_all_tasks] = useState([]);
    const [selected_assignee, set_selected_assignee] = useState("");
    const [task_sort_order, set_task_sort_order] = useState("due_date");
    const [selected_due_date, set_selected_due_date] = useState("");
    const [theme, set_theme] = useState(get_initial_theme);

    const [new_project_name, set_new_project_name] = useState("");

    useEffect(() => {
        fetch_projects();
    }, []);

    useEffect(() => {
        fetch_tasks(selected_project_id);
    }, [selected_project_id]);

    useEffect(() => {
        set_selected_assignee("");
        set_selected_due_date("");
    }, [selected_project_id]);

    useEffect(() => {
        document.documentElement.setAttribute("data-bs-theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const fetch_projects = async (preferred_project_id = selected_project_id) => {
        try {
            const response = await fetch("http://localhost:5001/api/projects");
            const data = await response.json();

            set_projects(data);

            if (data.length === 0) {
                set_selected_project_id(null);
                return;
            }

            const matching_project = data.find(
                (project) => project._id === preferred_project_id
            );

            if (matching_project) {
                set_selected_project_id(matching_project._id);
                return;
            }

            const first_active_project = data.find((project) => !project.archived);
            set_selected_project_id(first_active_project?._id || data[0]._id);
        }
        catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    };

    const fetch_tasks = async (project_id) => {
        if (!project_id) {
            set_all_tasks([]);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/projects/${project_id}/tasks`);
            const data = await response.json();
            set_all_tasks(data);
        }
        catch (error) {
            console.error("Failed to fetch tasks:", error);
            set_all_tasks([]);
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

            await fetch_projects(new_project._id);
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

    const active_projects = projects.filter((project) => !project.archived);
    const finished_projects = projects.filter((project) => project.archived);

    const tasks = all_tasks
        .filter((task) =>
            selected_assignee ? task.assignee === selected_assignee : true
        )
        .filter((task) => {
            if (!selected_due_date) {
                return true;
            }

            if (!task.due_date) {
                return false;
            }

            return get_local_date_key(task.due_date) === selected_due_date;
        })
        .toSorted((first_task, second_task) => {
        const priority_rank = {
            low: 1,
            medium: 2,
            high: 3
        };

        if (task_sort_order === "priority_high_to_low") {
            const priority_difference =
                (priority_rank[second_task.priority] || 0) -
                (priority_rank[first_task.priority] || 0);

            if (priority_difference !== 0) {
                return priority_difference;
            }
        }

        if (task_sort_order === "priority_low_to_high") {
            const priority_difference =
                (priority_rank[first_task.priority] || 0) -
                (priority_rank[second_task.priority] || 0);

            if (priority_difference !== 0) {
                return priority_difference;
            }
        }

        if (!first_task.due_date && !second_task.due_date) {
            return first_task.title.localeCompare(second_task.title);
        }

        if (!first_task.due_date) return 1;
        if (!second_task.due_date) return -1;

        return new Date(first_task.due_date) - new Date(second_task.due_date);
        });

    const toggle_theme = () => {
        set_theme((current_theme) =>
            current_theme === "light" ? "dark" : "light"
        );
    };

    return (
        <div className={`app-shell app-shell-${theme} min-vh-100`}>
            <Navbar theme={theme} onToggleTheme={toggle_theme} />

           <div className="container-fluid py-4">
                <div className="row g-4">
                    <div className="col-md-3 col-lg-3">
                        <ProjectList
                            active_projects={active_projects}
                            finished_projects={finished_projects}
                            selected_project_id={selected_project_id}
                            set_selected_project_id={set_selected_project_id}
                            all_tasks={all_tasks}
                            selected_due_date={selected_due_date}
                            set_selected_due_date={set_selected_due_date}
                        />
                    </div>

                   <div className="col-md-9 col-lg-9">
                        <TaskPanel
                            project={selected_project}
                            tasks={tasks}
                            all_tasks={all_tasks}
                            selected_assignee={selected_assignee}
                            task_sort_order={task_sort_order}
                            onAssigneeFilterChange={set_selected_assignee}
                            onTaskSortChange={set_task_sort_order}
                            onTaskCreated={fetch_tasks}
                            onProjectArchived={fetch_projects}
                        />
                    </div>
                </div>
            </div>

            <div className="modal fade" id="createProjectModal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content app-modal-content">
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
