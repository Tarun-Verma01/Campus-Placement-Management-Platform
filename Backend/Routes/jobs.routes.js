
const express = require("express");
const router = express.Router();

const {
    createJob,
    getJobs,
    updateJob,
    deleteJob
} = require("../controllers/jobController");

const {
    authMiddleware,
    authorizeRole
} = require("../Middleware/authMiddleware");

// Public: anyone can view jobs
router.get("/", getJobs);

// Admin only: manage jobs
router.post("/", authMiddleware, authorizeRole("admin"), createJob);
router.put("/:id", authMiddleware, authorizeRole("admin"), updateJob);
router.delete("/:id", authMiddleware, authorizeRole("admin"), deleteJob);

module.exports = router;
