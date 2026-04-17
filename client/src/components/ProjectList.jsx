function ProjectList({
    active_projects,
    finished_projects,
    selected_project_id,
    set_selected_project_id
}) {
    const render_project_button = (project) => (
        <button
            key={project._id}
            className={`list-group-item list-group-item-action ${
                selected_project_id === project._id ? "active" : ""
            }`}
            onClick={() => set_selected_project_id(project._id)}
        >
            <div className="fw-semibold d-flex justify-content-between align-items-center gap-2">
                <span>{project.name}</span>
                {project.archived ? (
                    <span className="badge rounded-pill text-bg-secondary">Finished</span>
                ) : null}
            </div>
            <small>{project.description}</small>
        </button>
    );

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">Projects</h5>
                        <button
                            className="btn btn-primary btn-sm"
                            data-bs-toggle="modal"
                            data-bs-target="#createProjectModal"
                        >
                            New Project
                        </button>
                </div>

                <div className="mb-4">
                    <div className="text-uppercase text-muted fw-semibold small mb-2">
                        Active Projects
                    </div>

                    <div className="list-group">
                        {active_projects.map(render_project_button)}
                        {active_projects.length === 0 ? (
                            <div className="list-group-item text-muted small">
                                No active projects yet.
                            </div>
                        ) : null}
                    </div>
                </div>

                <div>
                    <div className="text-uppercase text-muted fw-semibold small mb-2">
                        Finished Projects
                    </div>

                    <div className="list-group">
                        {finished_projects.map(render_project_button)}
                        {finished_projects.length === 0 ? (
                            <div className="list-group-item text-muted small">
                                Finished projects will show up here.
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectList;
