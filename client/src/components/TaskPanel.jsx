import TaskCard from "./TaskCard";

function TaskPanel({ project, tasks }) {
    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h4 className="mb-1">{project ? project.name : "No Project Selected"}</h4>
                        <p className="text-muted mb-0">
                            {project ? project.description : "Select a project to view tasks."}
                        </p>
                    </div>

                    <button className="btn btn-success btn-sm">New Task</button>
                </div>

                <div className="row g-3">
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <div className="col-md-6" key={task._id}>
                                <TaskCard task={task} />
                            </div>
                        ))
                    )
                    : (
                        <div className="col-12">
                            <div className="alert alert-secondary mb-0">
                                No tasks for this project yet.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TaskPanel;