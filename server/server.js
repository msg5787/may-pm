const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Project = require("./models/Project");

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

// ...
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});