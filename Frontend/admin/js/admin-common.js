function getCurrentAdmin() {

    const adminData = localStorage.getItem("currentAdmin");

    if (!adminData) {
        return null;
    }

    return JSON.parse(adminData);
}


// Protect Admin pages
function adminAuthGuard() {

    const admin = getCurrentAdmin();

    if (!admin) {
        alert("You are not logged in as an admin. Redirecting to login page.");

        window.location.href = "../login.html";
    }

    return admin;
}


// Admin Logout
function adminLogout() {

    localStorage.removeItem("currentAdmin");

    window.location.href = "../login.html";
}