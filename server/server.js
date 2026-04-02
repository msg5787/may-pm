const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const mongo_uri = process.env.MONGO_URI;

mongoose.connect(mongo_uri)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("MongoDB connection error:", error));

app.get("/api/health", (request, response) => {
    response.json({
        success: true,
        message: "Server is running"
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});