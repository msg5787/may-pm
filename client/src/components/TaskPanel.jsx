import { useState, useEffect } from "react";
import * as bootstrap from "bootstrap";
import TaskCard from "./TaskCard";

function TaskPanel({ project, tasks, onTaskCreated }) {
    const [new_task_title, set_new_task_title] = useState("");
    const [new_task_description, set_new_task_description] = useState("");
    const [new_task_assignee, set_new_task_assignee] = useState("");
    const [new_task_due_date, set_new_task_due_date] = useState("");
    const [new_task_priority, set_new_task_priority] = useState("medium");
    const [new_task_status, set_new_task_status] = useState("todo");

    useEffect(() => {
        if (!project?._id) {
            const modal_element = document.getElementById("createTaskModal");
            if (modal_element) {
                const modal_instance = bootstrap.Modal.getInstance(modal_element);
                if (modal_instance) {
                    modal_instance.hide();
                }
            }
        }
    }, [project]);

    const handle_open_modal = () => {
        if (!project?._id) {
            alert("Please select a project first.");
            return;
        }

        const modal_element = document.getElementById("createTaskModal");
        const modal_instance = new bootstrap.Modal(modal_element);
        modal_instance.show();
    };

    const handle_create_task = async (e) => {
        e.preventDefault();

        if (!project?._id) {
            alert("Please select a project first.");
            return;
        }

        if (!new_task_title.trim()) {
            alert("Task title is required.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/projects/${project._id}/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: new_task_title.trim(),
                    description: new_task_description.trim(),
                    assignee: new_task_assignee.trim(),
                    due_date: new_task_due_date
                        ? new Date(new_task_due_date).toISOString()
                        : null,
                    priority: new_task_priority,
                    status: new_task_status
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create task");
            }

            set_new_task_title("");
            set_new_task_description("");
            set_new_task_assignee("");
            set_new_task_due_date("");
            set_new_task_priority("medium");
            set_new_task_status("todo");

            const modal_element = document.getElementById("createTaskModal");
            const modal_instance = bootstrap.Modal.getInstance(modal_element);
            if (modal_instance) {
                modal_instance.hide();
            }

            if (onTaskCreated) {
                onTaskCreated(project._id);
            }
        }
        catch (error) {
            console.error("Failed to create task:", error);
            alert(error.message);
        }
    };

    return (
        <>
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h4 className="mb-1">
                                {project ? project.name : "No Project Selected"}
                            </h4>
                            <p className="text-muted mb-0">
                                {project
                                    ? project.description
                                    : "Select a project to view tasks."}
                            </p>
                        </div>

                        <button
                            className="btn btn-success btn-sm"
                            onClick={handle_open_modal}
                            disabled={!project}
                        >
                            New Task
                        </button>
                    </div>

                    <div className="row g-3">
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <div className="col-md-6" key={task._id}>
                                    <TaskCard task={task} />
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <div className="alert alert-secondary mb-0">
                                    No tasks for this project yet.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="modal fade" id="createTaskModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <form onSubmit={handle_create_task}>
                            <div className="modal-header">
                                <h5 className="modal-title">Create Task</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Task Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter task name"
                                        value={new_task_title}
                                        onChange={(e) => set_new_task_title(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Assignee</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter assignee name"
                                        value={new_task_assignee}
                                        onChange={(e) => set_new_task_assignee(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Due Date and Time</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        value={new_task_due_date}
                                        onChange={(e) => set_new_task_due_date(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Priority</label>
                                    <select
                                        className="form-select"
                                        value={new_task_priority}
                                        onChange={(e) => set_new_task_priority(e.target.value)}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Enter task description"
                                        value={new_task_description}
                                        onChange={(e) => set_new_task_description(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="mb-0">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={new_task_status}
                                        onChange={(e) => set_new_task_status(e.target.value)}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
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
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TaskPanel;