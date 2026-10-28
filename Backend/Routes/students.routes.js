const express = require("express");
const router = express.Router();

const {
    registerStudent,
    loginStudent,
    getStudents,
    updateStudentBlock,
    updateStudentProfile
} = require("../controllers/studentController");

const {
    authMiddleware,
    authorizeRole
} = require("../Middleware/authMiddleware");

// Public routes
router.post("/register", registerStudent);
router.post("/login", loginStudent);

// Admin-only routes
router.get("/", authMiddleware, authorizeRole("admin"), getStudents);
router.put("/:id/block", authMiddleware, authorizeRole("admin"), updateStudentBlock);

// Student can update their own profile
router.put("/:id/profile", authMiddleware, authorizeRole("student"), updateStudentProfile);

module.exports = router;