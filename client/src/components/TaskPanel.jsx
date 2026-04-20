import { useState, useEffect } from "react";
import * as bootstrap from "bootstrap";
import TaskCard from "./TaskCard";

function TaskPanel({
    project,
    tasks,
    all_tasks,
    selected_assignee,
    task_sort_order,
    quick_due_filter,
    selected_due_date,
    onAssigneeFilterChange,
    onTaskSortChange,
    onQuickDueFilterChange,
    onDateFilterReset,
    onTaskCreated,
    onProjectUpdated,
    onProjectArchived
}) {
    const parse_json_response = async (response) => {
        const response_text = await response.text();

        try {
            return response_text ? JSON.parse(response_text) : {};
        } catch {
            return {
                message: response_text || "Received a non-JSON response from the server."
            };
        }
    };

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
    const [selected_task_id, set_selected_task_id] = useState(null);
    const [dialog_title, set_dialog_title] = useState("");
    const [dialog_message, set_dialog_message] = useState("");
    const [dialog_variant, set_dialog_variant] = useState("info");
    const [dialog_confirm_label, set_dialog_confirm_label] = useState("Confirm");
    const [dialog_confirm_action, set_dialog_confirm_action] = useState(null);
    const [project_color_theme, set_project_color_theme] = useState("#2563eb");

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

    useEffect(() => {
        set_project_color_theme(project?.color_theme || "#2563eb");
    }, [project]);

    const show_dialog = ({
        title,
        message,
        variant = "info",
        confirm_label = "Confirm",
        on_confirm = null
    }) => {
        set_dialog_title(title);
        set_dialog_message(message);
        set_dialog_variant(variant);
        set_dialog_confirm_label(confirm_label);
        set_dialog_confirm_action(() => on_confirm);

        const modal_element = document.getElementById("taskActionModal");
        const modal_instance = bootstrap.Modal.getOrCreateInstance(modal_element);
        modal_instance.show();
    };

    const hide_dialog = () => {
        const modal_element = document.getElementById("taskActionModal");
        const modal_instance = bootstrap.Modal.getInstance(modal_element);
        if (modal_instance) {
            modal_instance.hide();
        }
    };

    const show_info_dialog = (message, title = "Notice") => {
        show_dialog({ title, message, variant: "info" });
    };

    const show_error_dialog = (message, title = "Something Went Wrong") => {
        show_dialog({ title, message, variant: "danger" });
    };

    const show_confirm_dialog = ({
        title,
        message,
        confirm_label = "Confirm",
        on_confirm
    }) => {
        show_dialog({
            title,
            message,
            variant: "confirm",
            confirm_label,
            on_confirm
        });
    };

    useEffect(() => {
        if (!selected_task_id) {
            return;
        }

        const selected_task_exists = tasks.some(
            (task) => task._id === selected_task_id
        );

        if (!selected_task_exists) {
            set_selected_task_id(null);
        }
    }, [tasks, selected_task_id]);

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
            show_info_dialog("Please select a project first.");
            return;
        }

        if (project.archived) {
            show_info_dialog("Archived projects are read-only.");
            return;
        }

        const modal_element = document.getElementById("createTaskModal");
        const modal_instance = new bootstrap.Modal(modal_element);
        modal_instance.show();
    };

    const handle_create_task = async (e) => {
        e.preventDefault();

        if (!project?._id) {
            show_info_dialog("Select a project first");
            return;
        }
        if (project.archived) {
            show_info_dialog("Archived projects are read-only.");
            return;
        }
        if (!new_task_title.trim()) {
            show_info_dialog("Task title required");
            return;
        }

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
            show_error_dialog(error.message);
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
            show_error_dialog(error.message);
        }
    };

    const archive_project = async () => {
        if (!project?._id || project.archived) return;

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
            show_error_dialog(error.message);
        }
    };

    const handle_archive_project = () => {
        if (!project?._id || project.archived) return;

        show_confirm_dialog({
            title: "Finish Project",
            message: `Move "${project.name}" to Finished Projects? Its tasks will stay available in the archive.`,
            confirm_label: "Finish Project",
            on_confirm: archive_project
        });
    };

    const handle_project_color_change = async (next_color) => {
        if (!project?._id || project.archived) {
            return;
        }

        set_project_color_theme(next_color);

        try {
            const response = await fetch(
                `http://localhost:5001/api/projects/${project._id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        color_theme: next_color
                    })
                }
            );

            const data = await parse_json_response(response);

            if (!response.ok) {
                throw new Error(data.message || "Failed to update project");
            }

            onProjectUpdated?.(project._id);
        } catch (error) {
            console.error(error);
            set_project_color_theme(project?.color_theme || "#2563eb");
            show_error_dialog(error.message);
        }
    };

    const handle_open_edit_modal = (task) => {
        if (project?.archived) {
            show_info_dialog("Archived projects are read-only.");
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

        if (project?.archived) {
            show_info_dialog("Archived projects are read-only.");
            return;
        }
        if (!editing_task?._id) {
            show_info_dialog("Select a task first");
            return;
        }
        if (!edit_task_title.trim()) {
            show_info_dialog("Task title required");
            return;
        }

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
            show_error_dialog(error.message);
        }
    };

    const delete_task = async (task) => {
        if (!task?._id) return;
        if (project?.archived) {
            show_info_dialog("Archived projects are read-only.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5001/api/tasks/${task._id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            if (editing_task?._id === task._id) {
                bootstrap.Modal.getInstance(
                    document.getElementById("editTaskModal")
                )?.hide();
                reset_edit_state();
            }

            if (selected_task_id === task._id) {
                set_selected_task_id(null);
            }

            onTaskCreated?.(project._id);
        } catch (error) {
            console.error(error);
            show_error_dialog(error.message);
        }
    };

    const handle_delete_task = (task) => {
        if (!task?._id) {
            return;
        }

        if (project?.archived) {
            show_info_dialog("Archived projects are read-only.");
            return;
        }

        show_confirm_dialog({
            title: "Delete Task",
            message: `Delete "${task.title}"? This cannot be undone.`,
            confirm_label: "Delete Task",
            on_confirm: () => delete_task(task)
        });
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

    const selected_task =
        tasks.find((task) => task._id === selected_task_id) || null;

    const handle_task_selection = (task) => {
        if (!task?._id) {
            return;
        }

        set_selected_task_id((current_task_id) =>
            current_task_id === task._id ? null : task._id
        );
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
            <div
                className="mb-3 p-3 border rounded app-stats-panel project-accent-panel"
                style={{
                    "--project-accent": project?.color_theme || "#2563eb"
                }}
            >
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
                <div
                    className="card-body"
                    style={{
                        "--project-accent": project?.color_theme || "#2563eb"
                    }}
                >

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap project-heading-row">
                                <span className="project-color-dot" aria-hidden="true"></span>
                                <h4 className="mb-0">
                                    {project ? project.name : "No Project Selected"}
                                </h4>
                                <input
                                    type="color"
                                    className="form-control form-control-color form-control-color-sm"
                                    value={project_color_theme}
                                    onChange={(e) => handle_project_color_change(e.target.value)}
                                    title="Change project color"
                                    disabled={!project || project.archived}
                                />

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm project-accent-outline-button"
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

                            <div className="mt-3 d-flex align-items-center gap-2 flex-wrap">
                                <div className="dropdown">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm dropdown-toggle project-accent-outline-button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        disabled={!project}
                                    >
                                        Filter
                                    </button>

                                    <div className="dropdown-menu p-3 task-filter-menu">
                                        <div className="mb-3">
                                            <label
                                                htmlFor="assignee-filter"
                                                className="form-label small fw-semibold mb-1"
                                            >
                                                Assignee
                                            </label>
                                            <select
                                                id="assignee-filter"
                                                className="form-select form-select-sm"
                                                value={selected_assignee}
                                                onChange={(e) =>
                                                    onAssigneeFilterChange(e.target.value)
                                                }
                                            >
                                                <option value="">All Assignees</option>
                                                {assignee_options.map((assignee) => (
                                                    <option key={assignee} value={assignee}>
                                                        {assignee}
                                                    </option>
                                                ))}
                                                </select>
                                        </div>

                                        <div className="mb-3">
                                            <label
                                                htmlFor="priority-sort"
                                                className="form-label small fw-semibold mb-1"
                                            >
                                                Sort by
                                            </label>
                                            <select
                                                id="priority-sort"
                                                className="form-select form-select-sm"
                                                value={task_sort_order}
                                                onChange={(e) =>
                                                    onTaskSortChange(e.target.value)
                                                }
                                            >
                                                <option value="due_date">Due Date</option>
                                                <option value="priority_high_to_low">
                                                    Priority: High to Low
                                                </option>
                                                <option value="priority_low_to_high">
                                                    Priority: Low to High
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="form-label small fw-semibold mb-2">
                                                Quick Due Filters
                                            </label>
                                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${
                                                        quick_due_filter === "overdue"
                                                            ? "btn-primary project-accent-button"
                                                            : "btn-outline-secondary project-accent-outline-button"
                                                    }`}
                                                    onClick={() =>
                                                        onQuickDueFilterChange(
                                                            quick_due_filter === "overdue"
                                                                ? "all"
                                                                : "overdue"
                                                        )
                                                    }
                                                >
                                                    Overdue
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${
                                                        quick_due_filter === "today"
                                                            ? "btn-primary project-accent-button"
                                                            : "btn-outline-secondary project-accent-outline-button"
                                                    }`}
                                                    onClick={() =>
                                                        onQuickDueFilterChange(
                                                            quick_due_filter === "today"
                                                                ? "all"
                                                                : "today"
                                                        )
                                                    }
                                                >
                                                    Due Today
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${
                                                        quick_due_filter === "week"
                                                            ? "btn-primary project-accent-button"
                                                            : "btn-outline-secondary project-accent-outline-button"
                                                    }`}
                                                    onClick={() =>
                                                        onQuickDueFilterChange(
                                                            quick_due_filter === "week"
                                                                ? "all"
                                                                : "week"
                                                        )
                                                    }
                                                >
                                                    Due This Week
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {(selected_assignee ||
                                    task_sort_order !== "due_date" ||
                                    quick_due_filter !== "all" ||
                                    selected_due_date) ? (
                                    <button
                                        type="button"
                                        className="btn btn-link btn-sm text-decoration-none px-0 project-link-button"
                                        onClick={() => {
                                            onAssigneeFilterChange("");
                                            onTaskSortChange("due_date");
                                            onQuickDueFilterChange("all");
                                            onDateFilterReset?.();
                                        }}
                                    >
                                        Reset
                                    </button>
                                ) : null}
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
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handle_delete_task(selected_task)}
                                disabled={!selected_task || !project || project.archived}
                            >
                                Delete Task
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm project-accent-button"
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
                                        } ${column.key === "todo" ? "project-todo-column" : ""}`}
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
                                                        onSelect={handle_task_selection}
                                                        onDragStart={handle_drag_start}
                                                        onDragEnd={handle_drag_end}
                                                        is_compact={column.key === "done"}
                                                        is_selected={selected_task_id === task._id}
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

            <div
                className="modal fade"
                id="taskActionModal"
                tabIndex="-1"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{dialog_title}</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>

                        <div className="modal-body">
                            <p className="mb-0">{dialog_message}</p>
                        </div>

                        <div className="modal-footer">
                            {dialog_variant === "confirm" ? (
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        data-bs-dismiss="modal"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => {
                                            hide_dialog();
                                            dialog_confirm_action?.();
                                        }}
                                    >
                                        {dialog_confirm_label}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className={`btn ${
                                        dialog_variant === "danger"
                                            ? "btn-danger"
                                            : "btn-primary"
                                    }`}
                                    data-bs-dismiss="modal"
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

export default TaskPanel;
