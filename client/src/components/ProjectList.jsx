function ProjectList({
    active_projects,
    finished_projects,
    selected_project_id,
    set_selected_project_id,
    all_tasks,
    selected_due_date,
    set_selected_due_date,
    selected_project
}) {
    const get_local_date_key = (value) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const week_days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + index);

        const due_count = all_tasks.filter((task) => {
            if (!task.due_date || task.status === "done") {
                return false;
            }

            const due_date = new Date(task.due_date);

            if (Number.isNaN(due_date.getTime())) {
                return false;
            }

            return get_local_date_key(due_date) === get_local_date_key(date);
        }).length;

        return {
            key: date.toISOString(),
            value: get_local_date_key(date),
            label: date.toLocaleDateString("en-US", { weekday: "short" }),
            day_number: date.getDate(),
            due_count,
            is_today: index === 0
        };
    });

    const render_project_button = (project) => (
        <button
            key={project._id}
            className={`list-group-item list-group-item-action project-list-item ${
                selected_project_id === project._id ? "active" : ""
            }`}
            onClick={() => set_selected_project_id(project._id)}
            style={{
                "--project-accent": project.color_theme || "#2563eb"
            }}
        >
            <div className="fw-semibold d-flex align-items-center gap-2">
                <span
                    className="project-color-dot"
                    aria-hidden="true"
                ></span>
                {project.name}
            </div>
            <small>{project.description}</small>
        </button>
    );

    return (
        <div
            className="card shadow-sm"
            style={{
                "--project-accent": selected_project?.color_theme || "#2563eb"
            }}
        >
            <div className="card-body project-sidebar-body">
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

                <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="text-uppercase text-muted fw-semibold small">
                            Upcoming Week
                        </div>
                        <small className="text-muted">Click a day to filter</small>
                    </div>

                    <div className="calendar-week-grid">
                        {week_days.map((day) => (
                            <button
                                type="button"
                                key={day.key}
                                className={`calendar-day-tile ${
                                    day.due_count > 0 ? "calendar-day-clickable" : ""
                                } ${
                                    selected_due_date === day.value
                                        ? "calendar-day-selected"
                                        : ""
                                } ${
                                    day.is_today ? "calendar-day-today" : ""
                                }`}
                                onClick={() => {
                                    if (day.due_count === 0) {
                                        return;
                                    }

                                    set_selected_due_date(
                                        selected_due_date === day.value ? "" : day.value
                                    );
                                }}
                                disabled={day.due_count === 0}
                            >
                                <span className="calendar-day-label">{day.label}</span>
                                <span className="calendar-day-number">{day.day_number}</span>
                                <span className="calendar-day-count">
                                    {day.due_count} due
                                </span>
                            </button>
                        ))}
                    </div>

                    {selected_due_date ? (
                        <button
                            type="button"
                            className="btn btn-link btn-sm text-decoration-none px-0 mt-2 project-link-button"
                            onClick={() => set_selected_due_date("")}
                        >
                            Clear date filter
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default ProjectList;