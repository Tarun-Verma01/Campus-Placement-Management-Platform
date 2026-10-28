const Student = require("../models/Student");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerStudent = async (req, res) => {
    try {
        const { name, email, password, branch, cgpa, skills } = req.body;

        const existingStudent = await Student.findOne({ email });

        if (existingStudent) {
            return res.status(400).json({
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await Student.create({
            name: name,
            email: email,
            password: hashedPassword,
            branch: branch,
            cgpa: cgpa,
            skills: skills
        });

        res.status(201).json({
            message: "Registration successful",
            student: {
                name: student.name,
                email: student.email,
                branch: student.branch,
                cgpa: student.cgpa,
                skills: student.skills
            }
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};



const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const student = await Student.findOne({ email });

        if (!student) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Reject blocked accounts before issuing a token
        if (student.blocked) {
            return res.status(403).json({
                message: "Your account has been blocked. Please contact the placement administrator."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            student.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Generate JWT after successful authentication
        const token = jwt.sign(
            {
                id: student._id.toString(),
                role: "student"
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            student: {
                _id: student._id,
                name: student.name,
                email: student.email,
                branch: student.branch,
                cgpa: student.cgpa,
                skills: student.skills
            }
        });

    } catch (error) {
        console.error("Student login error:", error.message);

        res.status(500).json({
            message: "Server error during login."
        });
    }
};



const getStudents = async (req, res) => {
    try {
        // Fetch students without exposing password hashes
        const students = await Student.find().select("-password");

        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({
            message: "Could not fetch students."
        });
    }
};

const updateStudentBlock = async (req, res) => {
    try {
        const { blocked } = req.body;

        if (typeof blocked !== "boolean") {
            return res.status(400).json({
                message: "Blocked must be true or false."
            });
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { blocked: blocked },
            { new: true, runValidators: true }
        ).select("-password");

        if (!student) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        res.status(200).json({
            message: "Student status updated successfully.",
            student: student
        });
    } catch (error) {
        res.status(500).json({
            message: "Could not update student status."
        });
    }
};



const updateStudentProfile = async (req, res) => {
    try {
        // Ensure students can update only their own profile
        if (req.user.id !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own profile."
            });
        }

        const { name, branch, cgpa, skills } = req.body;

        // Validate profile details
        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof branch !== "string" ||
            !branch.trim() ||
            !Number.isFinite(Number(cgpa)) ||
            Number(cgpa) < 0 ||
            Number(cgpa) > 10 ||
            !Array.isArray(skills) ||
            !skills.every(skill => typeof skill === "string")
        ) {
            return res.status(400).json({
                message: "Please provide valid profile details."
            });
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            {
                name: name.trim(),
                branch: branch.trim(),
                cgpa: Number(cgpa),
                skills: skills.map(skill => skill.trim()).filter(Boolean)
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!student) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully.",
            student
        });

    } catch (error) {
        console.error("Update profile error:", error.message);

        return res.status(500).json({
            message: "Could not update profile."
        });
    }
};



module.exports = {
    registerStudent,
    loginStudent,
    getStudents,
    updateStudentBlock,
    updateStudentProfile
};