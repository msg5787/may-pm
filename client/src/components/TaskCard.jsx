function TaskCard({ task }) {
    return (
        <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="card-title mb-0">{task.title}</h6>
                    <span className="badge text-bg-secondary">{task.status}</span>
                </div>

                <p className="card-text text-muted mb-0">
                    {task.description}
                </p>
            </div>
        </div>
    );
}

export default TaskCard;