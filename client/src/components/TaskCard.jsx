function TaskCard({ task, onStatusChange }) {
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
        has_due_date && new Date(task.due_date) < new Date();

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

    const formatted_priority = task.priority
        ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
        : "Medium";

    return (
        <div className="card h-100 border-0 shadow-sm task-card">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">{task.title}</h5>

                    <select
                        className={`form-select form-select-sm w-auto task-status-select ${
                            status_classes[task.status] || ""
                        }`}

                        value={task.status || "todo"}
                        onChange={(e) => onStatusChange(task._id, e.target.value)}
                    >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>

                <p className="task-priority mb-2">
                    <strong>Priority:</strong>{" "}
                    <span className={`badge ${priority_classes[task.priority] || "bg-secondary"}`}>
                        {formatted_priority}
                    </span>
                </p>

                {task.assignee && (
                    <p className="task-assignee mb-2">
                        <strong>Assignee:</strong> {task.assignee}
                    </p>
                )}

                <p className={`task-due mb-2 ${is_overdue ? "text-danger" : ""}`}>
                    <strong>Due:</strong>{" "}
                    {has_due_date ? (
                        formatted_due
                    ) : (
                        <span className="fst-italic">No due date</span>
                    )}
                </p>

                {task.description && (
                    <p className="task-description mb-0">
                        {task.description}
                    </p>
                )}
            </div>
        </div>
    );
}

export default TaskCard;