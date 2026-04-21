const mongoose = require("mongoose");

const project_schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        color_theme: {
            type: String,
            default: "#2563eb",
            trim: true
        },
        start_date: {
            type: Date,
            default: null
        },
        finish_date: {
            type: Date,
            default: null
        },
        archived: {
            type: Boolean,
            default: false
        },
        archivedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Project", project_schema);
