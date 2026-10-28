
const Application = require("../models/Application");
const Student = require("../models/Student");
const Job = require("../models/Job");

// ==========================================
// 1. APPLY FOR A JOB
// ==========================================

const applyForJob = async (req, res) => {
    try {
        // Get the logged-in student's ID from the verified token
        const studentId = req.user.id;

        // Find the student's actual database record
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        // Block applications from blocked accounts
        if (student.blocked) {
            return res.status(403).json({
                message: "Your account is blocked."
            });
        }

        const studentEmail = student.email;
        const jobId = req.body.jobId;

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required."
            });
        }

        // Find the job in the database
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found."
            });
        }

        // Validate branch eligibility
        const branchEligible =
            Array.isArray(job.branches) &&
            job.branches.includes(student.branch);

        if (!branchEligible) {
            return res.status(403).json({
                message: "Your branch is not eligible for this job."
            });
        }

        // Validate CGPA eligibility
        const studentCGPA = Number(student.cgpa);
        const minimumCGPA = Number(job.minCGPA);

        if (
            !Number.isFinite(studentCGPA) ||
            !Number.isFinite(minimumCGPA) ||
            studentCGPA < minimumCGPA
        ) {
            return res.status(403).json({
                message: "Your CGPA does not meet the requirement for this job."
            });
        }

        // Check whether this student already applied
        const existingApplication = await Application.findOne({
            studentEmail: studentEmail,
            jobId: jobId
        });

        if (existingApplication) {
            return res.status(409).json({
                message: "You have already applied for this job."
            });
        }

        // Create the application using trusted database values
        // Do not trust company or role supplied by the client
        const application = await Application.create({
            studentEmail: studentEmail,
            jobId: job._id.toString(),
            company: job.company,
            role: job.role
        });

        return res.status(201).json(application);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You have already applied for this job."
            });
        }

        // Invalid MongoDB ObjectId
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid job ID."
            });
        }

        console.error("Apply for job error:", error.message);

        return res.status(400).json({
            message: error.message
        });
    }
};


// ==========================================
// 2. GET APPLICATIONS
// ==========================================

const getApplications = async (req, res) => {
    try {
        let applications;

        // Admins can see every application
        if (req.user.role === "admin") {
            applications = await Application.find();
        }

        // Students can see only their own applications
        else {
            const student = await Student.findById(req.user.id);

            if (!student) {
                return res.status(404).json({
                    message: "Student not found."
                });
            }

            applications = await Application.find({
                studentEmail: student.email
            });
        }

        return res.status(200).json(applications);

    } catch (error) {
        console.error("Get applications error:", error.message);

        return res.status(500).json({
            message: "Could not load applications."
        });
    }
};


// ==========================================
// 3. UPDATE APPLICATION STATUS
// ==========================================

const updateApplication = async (req, res) => {
    try {
        const allowedStatuses = [
            "Applied",
            "Shortlisted",
            "Selected",
            "Rejected"
        ];

        // Check whether the status is valid
        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({
                message: "Invalid application status."
            });
        }

        // Find the application
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                message: "Application not found."
            });
        }

        // Save the previous status before changing it
        if (application.status !== req.body.status) {
            application.statusHistory.push({
                status: application.status
            });

            application.status = req.body.status;

            await application.save();
        }

        return res.status(200).json(application);

    } catch (error) {
        console.error("Update application error:", error.message);

        return res.status(400).json({
            message: error.message
        });
    }
};


// Export controller functions
module.exports = { applyForJob, getApplications, updateApplication};