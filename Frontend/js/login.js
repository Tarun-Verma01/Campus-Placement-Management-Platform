const loginbtn = document.getElementById("loginBtn");

loginbtn.addEventListener("click", async function () {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

// ADMIN AUTHENTICATION THROUGH BACKEND
if (email.toLowerCase() === "admin@hub.com") {
    try {
        const response = await fetch(
            "https://placementhub-api-crl7.onrender.com/api/admin/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Admin login failed.");
            return;
        }

        localStorage.setItem("currentAdmin", JSON.stringify(data.admin));
        localStorage.setItem("adminToken", data.token);

        window.location.href = "admin/admin-dashboard.html";
        return;

    } catch (error) {
        console.error("Admin login error:", error);
        alert("Could not connect to the server.");
        return;
    }
}


    // STUDENT AUTHENTICATION 
    try {
        const response = await fetch(
            "https://placementhub-api-crl7.onrender.com/api/students/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed.");
            return;
        }

        // Store only the safe student details returned by the backend
        localStorage.setItem(
            "currentStudent",
            JSON.stringify(data.student)
        );

        // Store the JWT for protected student API requests
        localStorage.setItem("studentToken", data.token);

        window.location.href = "student/dashboard.html";

    } catch (error) {
        console.error("Login error:", error);
        alert("Could not connect to the server. Make sure the backend is running.");
    }
});
