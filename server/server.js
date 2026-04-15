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

// Endpoints
app.get("/api/health", (request, response) => {
    response.json({
        success: true,
        message: "Server is running"
    });
});

app.get("/api/projects", async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
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
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Project name is required"
            });
        }

        const project = await Project.create({
            name: name.trim(),
            description: description ? description.trim() : ""
        });

        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to create project"
        });
    }
});

// get tasks for a project
app.get("/api/projects/:projectId/tasks", async (req, res) => {
    try {
        const { projectId } = req.params;

        const tasks = await Task.find({ project_id: projectId }).sort({ createdAt: -1 });
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

        const updated_task = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true, runValidators: true }
        );

        if (!updated_task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(updated_task);
    }
    catch (error) {
        console.error("Failed to update task status:", error);
        res.status(500).json({
            message: "Failed to update task status"
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

        const updated_task = await Task.findByIdAndUpdate(
            taskId,
            { status },
            { new: true, runValidators: true }
        );

        if (!updated_task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(updated_task);
    }
    catch (error) {
        console.error("Failed to update task status:", error);
        res.status(500).json({
            message: "Failed to update task status"
        });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});