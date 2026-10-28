const jwt = require("jsonwebtoken");

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // Ensure admin credentials are configured on the server
        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            return res.status(500).json({
                message: "Admin authentication is not configured."
            });
        }

        // Verify admin credentials
        if (
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
        ) {
            return res.status(401).json({
                message: "Invalid admin credentials."
            });
        }

        // Issue an admin JWT
        const token = jwt.sign(
            {
                role: "admin"
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Admin login successful",
            token,
            admin: {
                email: process.env.ADMIN_EMAIL,
                role: "admin"
            }
        });

    } catch (error) {
        console.error("Admin login error:", error.message);

        return res.status(500).json({
            message: "Server error during admin login."
        });
    }
};

module.exports = { loginAdmin };
