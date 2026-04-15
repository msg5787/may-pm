const mongoose = require("mongoose");

const task_schema = new mongoose.Schema(
    {
        project_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        assignee: {
            type: String,
            default: "",
            trim: true
        },
        due_date: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ["todo", "in_progress", "done"],
            default: "todo"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", task_schema);