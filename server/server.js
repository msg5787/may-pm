const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Project = require("./models/Project");
const Task = require("./models/Task");

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const mongo_uri = process.env.MONGO_URI;

mongoose.connect(mongo_uri)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("MongoDB connection error:", error));

const normalize_date_input = (value) => {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        const normalized_date = new Date(value);

        if (Number.isNaN(normalized_date.getTime())) {
            return null;
        }

        normalized_date.setHours(0, 0, 0, 0);
        return normalized_date;
    }

    if (typeof value === "string") {
        const trimmed_value = value.trim();

        if (!trimmed_value) {
            return null;
        }

        const date_only_match = trimmed_value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

        if (date_only_match) {
            const [, year, month, day] = date_only_match;
            const normalized_date = new Date(
                Number(year),
                Number(month) - 1,
                Number(day)
            );

            if (Number.isNaN(normalized_date.getTime())) {
                return null;
            }

            normalized_date.setHours(0, 0, 0, 0);
            return normalized_date;
        }

        const parsed_date = new Date(trimmed_value);

        if (Number.isNaN(parsed_date.getTime())) {
            return null;
        }

        parsed_date.setHours(0, 0, 0, 0);
        return parsed_date;
    }

    const parsed_date = new Date(value);

    if (Number.isNaN(parsed_date.getTime())) {
        return null;
    }

    parsed_date.setHours(0, 0, 0, 0);
    return parsed_date;
};

const get_today_at_local_midnight = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

// Endpoints
app.get("/api/health", (request, response) => {
    response.json({
        success: true,
        message: "Server is running"
    });
});

app.get("/api/projects", async (req, res) => {
    try {
        const projects = await Project.find().sort({ archived: 1, createdAt: -1 });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch projects"
        });
    }
});

app.post("/api/projects", async (req, res) => {
    try {
        const { name, description, color_theme, finish_date } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Project name is required"
            });
        }

        const created_start_date = get_today_at_local_midnight();
        let normalized_finish_date = null;

        if (finish_date) {
            normalized_finish_date = normalize_date_input(finish_date);

            if (!normalized_finish_date) {
                return res.status(400).json({
                    message: "Finish date is invalid"
                });
            }

            if (normalized_finish_date < created_start_date) {
                return res.status(400).json({
                    message: "Finish date must be on or after the project start date"
                });
            }
        }

        const project = await Project.create({
            name: name.trim(),
            description: description ? description.trim() : "",
            color_theme: color_theme || "#2563eb",
            start_date: created_start_date,
            finish_date: normalized_finish_date
        });

        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to create project"
        });
    }
});

app.patch("/api/projects/:projectId", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, description, color_theme, start_date, finish_date } = req.body;

        const existing_project = await Project.findById(projectId);

        if (!existing_project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        let next_start_date = start_date !== undefined
            ? (start_date || null)
            : existing_project.start_date;
        let next_finish_date = finish_date !== undefined
            ? (finish_date || null)
            : existing_project.finish_date;

        if (start_date !== undefined && next_start_date) {
            next_start_date = normalize_date_input(next_start_date);

            if (!next_start_date) {
                return res.status(400).json({
                    message: "Project dates are invalid"
                });
            }
        }

        if (finish_date !== undefined && next_finish_date) {
            next_finish_date = normalize_date_input(next_finish_date);

            if (!next_finish_date) {
                return res.status(400).json({
                    message: "Project dates are invalid"
                });
            }
        }

        if (next_start_date && next_finish_date) {
            if (next_finish_date < next_start_date) {
                return res.status(400).json({
                    message: "Finish date must be on or after the project start date"
                });
            }
        }

        const updated_project = await Project.findByIdAndUpdate(
            projectId,
            {
                name: name && name.trim() ? name.trim() : existing_project.name,
                description: typeof description === "string"
                    ? description.trim()
                    : existing_project.description,
                color_theme: color_theme || existing_project.color_theme || "#2563eb",
                start_date: next_start_date,
                finish_date: next_finish_date
            },
            { new: true, runValidators: true }
        );

        res.json(updated_project);
    }
    catch (error) {
        console.error("Failed to update project:", error);
        res.status(500).json({
            message: "Failed to update project"
        });
    }
});

// get tasks for a project
app.get("/api/projects/:projectId/tasks", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { assignee } = req.query;

        const task_filter = { project_id: projectId };

        if (assignee && assignee.trim()) {
            task_filter.assignee = assignee.trim();
        }

        const tasks = await Task.find(task_filter).sort({ createdAt: -1 });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch tasks"
        });
    }
});

// create a task for a project
app.post("/api/projects/:projectId/tasks", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, assignee, due_date, priority, status } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (project.archived) {
            return res.status(400).json({
                message: "Archived projects are read-only"
            });
        }

        const task = await Task.create({
            project_id: projectId,
            title: title.trim(),
            description: description ? description.trim() : "",
            assignee: assignee ? assignee.trim() : "",
            due_date: due_date || null,
            priority: priority || "medium",
            status: status || "todo"
        });

        res.status(201).json(task);
    }
    catch (error) {
        console.error("Failed to create task:", error);
        res.status(500).json({
            message: "Failed to create task"
        });
    }
});

app.patch("/api/projects/:projectId/archive", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { finish_date } = req.body || {};

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const finished_date = finish_date
            ? normalize_date_input(finish_date)
            : get_today_at_local_midnight();

        if (!finished_date) {
            return res.status(400).json({
                message: "Finish date is invalid"
            });
        }

        if (project.start_date && finished_date < project.start_date) {
            return res.status(400).json({
                message: "Finish date must be on or after the project start date"
            });
        }

        const archived_project = await Project.findByIdAndUpdate(
            projectId,
            {
                archived: true,
                archivedAt: new Date(),
                finish_date: finished_date
            },
            { new: true, runValidators: true }
        );

        res.json(archived_project);
    }
    catch (error) {
        console.error("Failed to archive project:", error);
        res.status(500).json({
            message: "Failed to archive project"
        });
    }
});

app.patch("/api/tasks/:taskId", async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, assignee, due_date, priority, status } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const existing_task = await Task.findById(taskId);

        if (!existing_task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const project = await Project.findById(existing_task.project_id);

        if (project?.archived) {
            return res.status(400).json({
                message: "Archived projects are read-only"
            });
        }

        const updated_task = await Task.findByIdAndUpdate(
            taskId,
            {
                title: title.trim(),
                description: description ? description.trim() : "",
                assignee: assignee ? assignee.trim() : "",
                due_date: due_date || null,
                priority: priority || "medium",
                status: status || "todo"
            },
            { new: true, runValidators: true }
        );

        res.json(updated_task);
    }
    catch (error) {
        console.error("Failed to update task:", error);
        res.status(500).json({
            message: "Failed to update task"
        });
    }
});

app.patch("/api/tasks/:taskId/status", async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const allowed_statuses = ["todo", "in_progress", "done"];

        if (!allowed_statuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const existing_task = await Task.findById(taskId);

        if (!existing_task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const project = await Project.findById(existing_task.project_id);

        if (project?.archived) {
            return res.status(400).json({
                message: "Archived projects are read-only"
            });
        }

        const updated_task = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true, runValidators: true }
        );

        res.json(updated_task);
    }
    catch (error) {
        console.error("Failed to update task status:", error);
        res.status(500).json({
            message: "Failed to update task status"
        });
    }
});

app.delete("/api/tasks/:taskId", async (req, res) => {
    try {
        const { taskId } = req.params;

        const existing_task = await Task.findById(taskId);

        if (!existing_task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const project = await Project.findById(existing_task.project_id);

        if (project?.archived) {
            return res.status(400).json({
                message: "Archived projects are read-only"
            });
        }

        await Task.findByIdAndDelete(taskId);

        res.json({
            message: "Task deleted successfully"
        });
    }
    catch (error) {
        console.error("Failed to delete task:", error);
        res.status(500).json({
            message: "Failed to delete task"
        });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
