const express = require("express");
const router = express.Router();

const {
    applyForJob,
    getApplications,
    updateApplication
} = require("../controllers/applicationController");


const { authMiddleware, authorizeRole } = require("../Middleware/authMiddleware");

router.post( "/", authMiddleware, authorizeRole("student"), applyForJob);

// Logged-in users can access the application list.
// The controller must filter results based on the user's role.
router.get("/", authMiddleware, getApplications);

// Only admins can update application statuses
router.put("/:id", authMiddleware, authorizeRole("admin"),updateApplication);

module.exports = router;