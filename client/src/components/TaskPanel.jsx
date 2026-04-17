import { useState, useEffect } from "react";
import * as bootstrap from "bootstrap";
import TaskCard from "./TaskCard";

function TaskPanel({
    project,
    tasks,
    all_tasks,
    selected_assignee,
    onAssigneeFilterChange,
    onTaskCreated,
    onProjectArchived
}) {
    const [dragged_task_id, set_dragged_task_id] = useState(null);
    const [drag_over_status, set_drag_over_status] = useState(null);
    const [new_task_title, set_new_task_title] = useState("");
    const [new_task_description, set_new_task_description] = useState("");
    const [new_task_assignee, set_new_task_assignee] = useState("");
    const [new_task_due_date, set_new_task_due_date] = useState("");
    const [new_task_priority, set_new_task_priority] = useState("medium");
    const [new_task_status, set_new_task_status] = useState("todo");
    const [editing_task, set_editing_task] = useState(null);
    const [edit_task_title, set_edit_task_title] = useState("");
    const [edit_task_description, set_edit_task_description] = useState("");
    const [edit_task_assignee, set_edit_task_assignee] = useState("");
    const [edit_task_due_date, set_edit_task_due_date] = useState("");
    const [edit_task_priority, set_edit_task_priority] = useState("medium");
    const [edit_task_status, set_edit_task_status] = useState("todo");

    const assignee_options = Array.from(
        new Set(
            all_tasks
                .map((task) => task.assignee?.trim())
                .filter(Boolean)
        )
    ).sort((a, b) => a.localeCompare(b));

    useEffect(() => {
        if (!project?._id) {
            const modal_element = document.getElementById("createTaskModal");
            const modal_instance = bootstrap.Modal.getInstance(modal_element);
            if (modal_instance) modal_instance.hide();

            const edit_modal_element = document.getElementById("editTaskModal");
            const edit_modal_instance = bootstrap.Modal.getInstance(edit_modal_element);
            if (edit_modal_instance) edit_modal_instance.hide();
        }
    }, [project]);

    const format_datetime_local = (value) => {
        if (!value) return "";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const timezone_offset = date.getTimezoneOffset();
        const local_date = new Date(date.getTime() - timezone_offset * 60000);

        return local_date.toISOString().slice(0, 16);
    };

    const handle_open_modal = () => {
        if (!project?._id) {
            alert("Please select a project first.");
            return;
        }

        if (project.archived) {
            alert("Archived projects are read-only.");
            return;
        }

        const modal_element = document.getElementById("createTaskModal");
        const modal_instance = new bootstrap.Modal(modal_element);
        modal_instance.show();
    };

    const handle_create_task = async (e) => {
        e.preventDefault();

        if (!project?._id) return alert("Select a project first");
        if (project.archived) return alert("Archived projects are read-only.");
        if (!new_task_title.trim()) return alert("Task title required");

        try {
            const response = await fetch(
                `http://localhost:5001/api/projects/${project._id}/tasks`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
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
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            set_new_task_title("");
            set_new_task_description("");
            set_new_task_assignee("");
            set_new_task_due_date("");
            set_new_task_priority("medium");
            set_new_task_status("todo");

            bootstrap.Modal.getInstance(
                document.getElementById("createTaskModal")
            )?.hide();

            onTaskCreated?.(project._id);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const handle_status_change = async (task_id, new_status) => {
        if (project?.archived) return;

        try {
            const response = await fetch(
                `http://localhost:5001/api/tasks/${task_id}/status`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: new_status })
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            onTaskCreated?.(project._id);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const handle_archive_project = async () => {
        if (!project?._id || project.archived) return;

        const confirmed = window.confirm(
            `Move "${project.name}" to Finished Projects? Its tasks will stay available in the archive.`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5001/api/projects/${project._id}/archive`,
                {
                    method: "PATCH"
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            onAssigneeFilterChange("");
            onProjectArchived?.(project._id);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const handle_open_edit_modal = (task) => {
        if (project?.archived) {
            alert("Archived projects are read-only.");
            return;
        }

        set_editing_task(task);
        set_edit_task_title(task.title || "");
        set_edit_task_description(task.description || "");
        set_edit_task_assignee(task.assignee || "");
        set_edit_task_due_date(format_datetime_local(task.due_date));
        set_edit_task_priority(task.priority || "medium");
        set_edit_task_status(task.status || "todo");

        const modal_element = document.getElementById("editTaskModal");
        const modal_instance = new bootstrap.Modal(modal_element);
        modal_instance.show();
    };

    const handle_update_task = async (e) => {
        e.preventDefault();

        if (project?.archived) return alert("Archived projects are read-only.");
        if (!editing_task?._id) return alert("Select a task first");
        if (!edit_task_title.trim()) return alert("Task title required");

        try {
            const response = await fetch(
                `http://localhost:5001/api/tasks/${editing_task._id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: edit_task_title.trim(),
                        description: edit_task_description.trim(),
                        assignee: edit_task_assignee.trim(),
                        due_date: edit_task_due_date
                            ? new Date(edit_task_due_date).toISOString()
                            : null,
                        priority: edit_task_priority,
                        status: edit_task_status
                    })
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            bootstrap.Modal.getInstance(
                document.getElementById("editTaskModal")
            )?.hide();

            set_editing_task(null);
            onTaskCreated?.(project._id);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const reset_edit_state = () => {
        set_editing_task(null);
        set_edit_task_title("");
        set_edit_task_description("");
        set_edit_task_assignee("");
        set_edit_task_due_date("");
        set_edit_task_priority("medium");
        set_edit_task_status("todo");
    };


    const tasks_by_status = {
        todo: tasks.filter((task) => task.status === "todo"),
        in_progress: tasks.filter((task) => task.status === "in_progress"),
        done: tasks.filter((task) => task.status === "done")
    };

    const column_config = [
        {
            key: "todo",
            title: "To Do",
            empty_message: "Drop a task here to plan it."
        },
        {
            key: "in_progress",
            title: "In Progress",
            empty_message: "Drag a task here when work starts."
        },
        {
            key: "done",
            title: "Done",
            empty_message: "Drag a task here when it is finished."
        }
    ];

    const active_tasks = tasks.filter(task => task.status !== "done");
    const completed_tasks = tasks_by_status.done;

    const total_tasks = active_tasks.length;

    const in_progress_tasks = active_tasks.filter(
        task => task.status === "in_progress"
    ).length;

    const completion_percentage =
        tasks.length === 0
            ? 0
            : Math.round(
                  (completed_tasks.length / tasks.length) * 100
              );

    const handle_drag_start = (event, task) => {
        if (project?.archived) {
            event.preventDefault();
            return;
        }

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task._id);
        set_dragged_task_id(task._id);
    };

    const handle_drag_end = () => {
        set_dragged_task_id(null);
        set_drag_over_status(null);
    };

    const handle_drag_over = (event, status) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";

        if (drag_over_status !== status) {
            set_drag_over_status(status);
        }
    };

    const handle_drop = async (event, status) => {
        event.preventDefault();

        if (project?.archived) {
            return;
        }

        const task_id = event.dataTransfer.getData("text/plain") || dragged_task_id;
        const dropped_task = all_tasks.find((task) => task._id === task_id);

        set_drag_over_status(null);
        set_dragged_task_id(null);

        if (!dropped_task || dropped_task.status === status) {
            return;
        }

        await handle_status_change(task_id, status);
    };

    return (
        <>
            {/* STATS */}
            <div className="mb-3 p-3 border rounded app-stats-panel">
                <div className="d-flex justify-content-between flex-wrap">

                    <span className="fw-bold">
                        {total_tasks} active tasks
                    </span>

                    <span className="fw-bold">
                        {in_progress_tasks} in progress
                    </span>

                    <span className="fw-bold text-success">
                        {completion_percentage}% complete
                    </span>

                </div>

                <div className="progress mt-2 app-progress">
                    <div
                        className="progress-bar app-progress-bar"
                        role="progressbar"
                        style={{ width: `${completion_percentage}%` }}
                    >
                        {completion_percentage}%
                    </div>
                </div>
            </div>

            {/* MAIN CARD */}
            <div className="card shadow-sm">
                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                <h4 className="mb-0">
                                    {project ? project.name : "No Project Selected"}
                                </h4>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={handle_archive_project}
                                    disabled={!project || project.archived}
                                >
                                    Finish Project
                                </button>
                            </div>

                            <p className="text-muted mb-0">
                                {project
                                    ? project.description
                                    : "Select a project to view tasks."}
                            </p>

                            <div className="mt-3">
                                <select
                                    className="form-select form-select-sm"
                                    value={selected_assignee}
                                    onChange={(e) => onAssigneeFilterChange(e.target.value)}
                                    disabled={!project}
                                >
                                    <option value="">All Assignees</option>
                                    {assignee_options.map((assignee) => (
                                        <option key={assignee} value={assignee}>
                                            {assignee}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {project?.archived ? (
                                <div className="mt-3">
                                    <span className="badge text-bg-secondary">
                                        Finished Project Archive
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={handle_open_modal}
                                disabled={!project || project.archived}
                            >
                                New Task
                            </button>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Task Board</h5>
                        <span className="text-muted small">
                            {project?.archived
                                ? "Finished projects keep their tasks as a read-only archive."
                                : "Drag cards between the status lanes to update progress."}
                        </span>
                    </div>

                    <div className="row g-4">
                        {column_config.map((column) => {
                            const column_tasks = tasks_by_status[column.key];
                            const is_active_dropzone = drag_over_status === column.key;

                            return (
                                <div className="col-12 col-md-4" key={column.key}>
                                    <div
                                        className={`task-column h-100 p-3 rounded-3 border ${
                                            is_active_dropzone ? "task-column-active" : ""
                                        }`}
                                        onDragOver={(event) => handle_drag_over(event, column.key)}
                                        onDragLeave={() => {
                                            if (drag_over_status === column.key) {
                                                set_drag_over_status(null);
                                            }
                                        }}
                                        onDrop={(event) => handle_drop(event, column.key)}
                                    >
                                        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                            <h6 className="text-muted mb-0">{column.title}</h6>
                                            <span className="badge text-bg-light">
                                                {column_tasks.length}
                                            </span>
                                        </div>

                                        <div className="task-column-list d-flex flex-column gap-3">
                                            {column_tasks.length > 0 ? (
                                                column_tasks.map((task) => (
                                                    <TaskCard
                                                        key={task._id}
                                                        task={task}
                                                        onEdit={handle_open_edit_modal}
                                                        onDragStart={handle_drag_start}
                                                        onDragEnd={handle_drag_end}
                                                        is_read_only={project?.archived}
                                                    />
                                                ))
                                            ) : (
                                                <div className="task-column-empty">
                                                    {column.empty_message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>

            {/* MODAL */}
            <div className="modal fade" id="createTaskModal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <form onSubmit={handle_create_task}>
                            <div className="modal-header">
                                <h5 className="modal-title">Create Task</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    onClick={reset_edit_state}
                                />
                            </div>

                            <div className="modal-body">
                                <input
                                    className="form-control mb-2"
                                    placeholder="Task name"
                                    value={new_task_title}
                                    onChange={(e) =>
                                        set_new_task_title(e.target.value)
                                    }
                                />

                                <input
                                    className="form-control mb-2"
                                    placeholder="Assignee"
                                    value={new_task_assignee}
                                    onChange={(e) =>
                                        set_new_task_assignee(e.target.value)
                                    }
                                />

                                <input
                                    type="datetime-local"
                                    className="form-control mb-2"
                                    value={new_task_due_date}
                                    onChange={(e) =>
                                        set_new_task_due_date(e.target.value)
                                    }
                                />

                                <select
                                    className="form-select mb-2"
                                    value={new_task_priority}
                                    onChange={(e) =>
                                        set_new_task_priority(e.target.value)
                                    }
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>

                                <textarea
                                    className="form-control mb-2"
                                    placeholder="Description"
                                    value={new_task_description}
                                    onChange={(e) =>
                                        set_new_task_description(e.target.value)
                                    }
                                />

                                <select
                                    className="form-select"
                                    value={new_task_status}
                                    onChange={(e) =>
                                        set_new_task_status(e.target.value)
                                    }
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                    type="button"
                                    onClick={reset_edit_state}
                                >
                                    Cancel
                                </button>
                                <button className="btn btn-primary">
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="editTaskModal" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <form onSubmit={handle_update_task}>
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Task</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                />
                            </div>

                            <div className="modal-body">
                                <input
                                    className="form-control mb-2"
                                    placeholder="Task name"
                                    value={edit_task_title}
                                    onChange={(e) =>
                                        set_edit_task_title(e.target.value)
                                    }
                                />

                                <input
                                    className="form-control mb-2"
                                    placeholder="Assignee"
                                    value={edit_task_assignee}
                                    onChange={(e) =>
                                        set_edit_task_assignee(e.target.value)
                                    }
                                />

                                <input
                                    type="datetime-local"
                                    className="form-control mb-2"
                                    value={edit_task_due_date}
                                    onChange={(e) =>
                                        set_edit_task_due_date(e.target.value)
                                    }
                                />

                                <select
                                    className="form-select mb-2"
                                    value={edit_task_priority}
                                    onChange={(e) =>
                                        set_edit_task_priority(e.target.value)
                                    }
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>

                                <textarea
                                    className="form-control mb-2"
                                    placeholder="Description"
                                    value={edit_task_description}
                                    onChange={(e) =>
                                        set_edit_task_description(e.target.value)
                                    }
                                />

                                <select
                                    className="form-select"
                                    value={edit_task_status}
                                    onChange={(e) =>
                                        set_edit_task_status(e.target.value)
                                    }
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button className="btn btn-primary">
                                    Save Changes
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
