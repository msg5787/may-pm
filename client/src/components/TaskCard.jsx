function TaskCard({ task }) {
    const formatted_due_date = task.due_date
        ? new Date(task.due_date).toLocaleDateString()
        : null;

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

                {formatted_due_date && (
                    <p className="text-muted mb-2">
                        <strong>Due:</strong> {formatted_due_date}
                    </p>
                )}

                {task.description && (
                    <p className="card-text mb-0">{task.description}</p>
                )}
            </div>
        </div>
    );
}

export default TaskCard;