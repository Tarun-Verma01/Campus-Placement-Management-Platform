const currentStudent = authGuard();

const API_URL = "https://placementhub-api-crl7.onrender.com/api";

const container = document.getElementById("applicationsContainer");
const template = document.getElementById("applicationCardTemplate");
const emptyState = document.getElementById("emptyState");

// Load applications and related job details.
async function loadMyApplications() {
    if (!currentStudent) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/applications", {
            headers: {
                Authorization:
                    "Bearer " + localStorage.getItem("studentToken")
            }
        });

        if (!response.ok) {
            throw new Error("Could not load applications.");
        }

        const allApplications = await response.json();

        // Keep only the logged-in student's applications.
        const myApplications = allApplications.filter(function (application) {
            return application.studentEmail === currentStudent.email;
        });

        // Fetch jobs to obtain location and salary.
        const jobsResponse = await fetch(API_URL + "/jobs");

        let jobsById = new Map();

        if (jobsResponse.ok) {
            const jobs = await jobsResponse.json();

            if (Array.isArray(jobs)) {
                jobsById = new Map(
                    jobs.map(function (job) {
                        return [String(job._id), job];
                    })
                );
            }
        }

        // Remove previously rendered application cards.
        container
            .querySelectorAll(".app-item:not(#emptyState)")
            .forEach(function (card) {
                card.remove();
            });

        if (myApplications.length === 0) {
            emptyState.style.display = "block";
            return;
        }

        emptyState.style.display = "none";

        myApplications.forEach(function (application) {
            const card = template.content.cloneNode(true);

            // Support either a populated jobId object or a plain ID.
            const jobId =
                application.jobId && application.jobId._id
                    ? application.jobId._id
                    : application.jobId;

            const job = jobsById.get(String(jobId));

            card.querySelector('[data-field="company"]').textContent =
                application.company || (job && job.company) || "—";

            card.querySelector('[data-field="role"]').textContent =
                application.role || (job && job.role) || "—";

            card.querySelector('[data-field="location"]').textContent =
                (job && job.location) ||
                application.location ||
                "Not available";

            card.querySelector('[data-field="package"]').textContent =
                (job && job.salary) ||
                application.salary ||
                application.package ||
                "Not available";

            card.querySelector('[data-field="appliedAt"]').textContent =
                formatDate(application.appliedAt);

            card.querySelector('[data-field="status"]').textContent =
                application.status || "Applied";

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Applications loading error:", error);

        emptyState.style.display = "block";

        const heading = emptyState.querySelector("h2, h3");
        const message = emptyState.querySelector("p");

        if (heading) {
            heading.textContent = "Could not load applications";
        }

        if (message) {
            message.textContent =
                "Please check your connection and try again.";
        }
    }
}

// Format the application date.
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
