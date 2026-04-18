function TaskCard({
    task,
    onEdit,
    onSelect,
    onDragStart,
    onDragEnd,
    is_compact = false,
    is_selected = false,
    is_read_only = false
}) {
    const has_due_date = !!task.due_date;

    const formatted_due = has_due_date
        ? new Date(task.due_date).toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit"
          })
        : null;

    const is_overdue =
        has_due_date &&
        task.status !== "done" &&
        new Date(task.due_date) < new Date();

    const priority_classes = {
        low: "priority-low",
        medium: "priority-medium",
        high: "priority-high"
    };

    const status_classes = {
        todo: "status-todo",
        in_progress: "status-progress",
        done: "status-done"
    };

    const status_labels = {
        todo: "To Do",
        in_progress: "In Progress",
        done: "Done"
    };

    const formatted_priority = task.priority
        ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
        : "Medium";

    return (
        <div
            className={`card h-100 border-0 shadow-sm task-card ${
                is_overdue ? "task-card-overdue" : ""
            } ${is_selected ? "task-card-selected" : ""} ${
                is_compact ? "task-card-compact" : ""
            }`}
            draggable={!is_read_only}
            onClick={() => onSelect(task)}
            onDragStart={(event) => onDragStart(event, task)}
            onDragEnd={onDragEnd}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(task);
                }
            }}
        >
            <div className="card-body task-card-body">
                {is_overdue && (
                    <p className="task-overdue mb-2">
                        <strong>OVERDUE</strong>
                    </p>
                )}

                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <h6 className="card-title task-card-title mb-0">{task.title}</h6>

                    <div className="d-flex align-items-start gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm task-edit-button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onEdit(task);
                            }}
                            disabled={is_read_only}
                        >
                            Edit
                        </button>
                    </div>
                </div>

                <div className="task-meta-row">
                    {!is_compact ? (
                        <span className={`badge ${status_classes[task.status] || "bg-secondary"}`}>
                            {status_labels[task.status] || "To Do"}
                        </span>
                    ) : null}
                    {!is_compact ? (
                        <span className={`badge ${priority_classes[task.priority] || "bg-secondary"}`}>
                            {formatted_priority}
                        </span>
                    ) : null}
                    {task.assignee ? (
                        <span className="task-meta-text">{task.assignee}</span>
                    ) : null}
                    {is_compact && has_due_date ? (
                        <span className="task-meta-text">{formatted_due}</span>
                    ) : null}
                </div>

                {!is_compact ? (
                    <p className="task-due mb-0">
                        {has_due_date ? (
                            formatted_due
                        ) : (
                            <span className="task-meta-text fst-italic">No due date</span>
                        )}
                    </p>
                ) : null}

                {!is_compact && task.description && (
                    <p className="task-description mb-0">
                        {task.description}
                    </p>
                )}
            </div>
        </div>
    );
}

export default TaskCard;
