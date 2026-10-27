function getCurrentStudent() {
    const studentData = localStorage.getItem("currentStudent");

    if (!studentData) {
        return null;
    }

    try {
        return JSON.parse(studentData);
    } catch (error) {
        return null;
    }
}

// Protect student pages
function authGuard() {
    const student = getCurrentStudent();

    if (!student) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = "../login.html";
        return null;
    }

    return student;
}

// Log out
function logout() {
    localStorage.removeItem("currentStudent");
    window.location.href = "../index.html";
}
