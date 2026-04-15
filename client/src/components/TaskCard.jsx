function TaskCard({ task }) {
    const has_due_date = !!task.due_date;

    const formatted_due = has_due_date
        ? new Date(task.due_date).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit"
          })
        : null;

    const is_overdue =
        has_due_date && new Date(task.due_date) < new Date();

    return (
        <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{task.title}</h5>
                    <span className="badge bg-secondary">{task.status}</span>
                </div>

                {task.assignee && (
                    <p className="text-muted mb-2">
                        <strong>Assignee:</strong> {task.assignee}
                    </p>
                )}

                <p className={`mb-2 ${is_overdue ? "text-danger" : "text-muted"}`}>
                    <strong>Due:</strong>{" "}
                    {has_due_date ? (
                        formatted_due
                    ) : (
                        <span className="fst-italic text-secondary">
                            No due date
                        </span>
                    )}
                </p>

                {task.description && (
                    <p className="card-text mb-0">{task.description}</p>
                )}
            </div>
        </div>
    );
}

export default TaskCard;