function ProjectList({ projects, selected_project_id, set_selected_project_id }) {
    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Projects</h5>
                    <button className="btn btn-primary btn-sm">New Project</button>
                </div>

                <div className="list-group">
                    {projects.map((project) => (
                        <button
                            key={project._id}
                            type="button"
                            className={`list-group-item list-group-item-action ${
                                selected_project_id === project._id ? "active" : ""
                            }`}
                            onClick={() => set_selected_project_id(project._id)}
                        >
                            <div className="fw-semibold">{project.name}</div>
                            <small>{project.description}</small>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProjectList;