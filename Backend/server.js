const express = require("express");
require("dotenv").config();
const cors = require("cors");
const jobRoutes = require("./Routes/jobs.routes");
const applicationRoutes = require("./Routes/applications.routes");
const studentRoutes = require("./Routes/students.routes");
const adminRoutes = require("./Routes/admin.routes");


const connectDB = require("./config/db");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "PlacementHub API is running"
    });
});


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to the database:", error.message);
        process.exit(1);
    });
