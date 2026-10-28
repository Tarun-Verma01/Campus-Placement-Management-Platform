const currentStudent = authGuard();

const API_URL = "http://localhost:5000/api";

const container = document.getElementById("applicationsContainer");
const template = document.getElementById("applicationCardTemplate");
const emptyState = document.getElementById("emptyState");

// Load applications from MongoDB through the backend API
async function loadMyApplications() {
    if (!currentStudent) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/applications", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("studentToken")
            }
        });

        if (!response.ok) {
            throw new Error("Could not load applications.");
        }

        const allApplications = await response.json();

        // Show only applications belonging to the logged-in student
        const myApplications = allApplications.filter(function (application) {
            return application.studentEmail === currentStudent.email;
        });

        // Remove previously rendered cards
        container.querySelectorAll(".app-item:not(#emptyState)").forEach(
            function (card) {
                card.remove();
            }
        );

        if (myApplications.length === 0) {
            emptyState.style.display = "block";
            return;
        }

        emptyState.style.display = "none";

        myApplications.forEach(function (application) {
            const card = template.content.cloneNode(true);

            card.querySelector('[data-field="company"]').textContent =
                application.company || "—";

            card.querySelector('[data-field="role"]').textContent =
                application.role || "—";

            card.querySelector('[data-field="location"]').textContent =
                application.location || "Not available";

            card.querySelector('[data-field="package"]').textContent =
                application.package || "Not available";

            card.querySelector('[data-field="appliedAt"]').textContent =
                formatDate(application.appliedAt);

            card.querySelector('[data-field="status"]').textContent =
                application.status || "Applied";

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Applications loading error:", error);
        emptyState.style.display = "block";
        emptyState.querySelector("h2").textContent =
            "Could not load applications";
        emptyState.querySelector("p").textContent =
            "Please check your connection and try again.";
    }
}

// Format the application date for display
function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString();
}

loadMyApplications();
