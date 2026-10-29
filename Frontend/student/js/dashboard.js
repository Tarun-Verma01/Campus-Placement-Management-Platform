const currentStudent = authGuard();

const API_URL = "https://placementhub-api-crl7.onrender.com/api";

async function loadDashboard() {
    if (!currentStudent) {
        return;
    }

    try {
        // Fetch jobs and applications from MongoDB API
        const [jobsResponse, applicationsResponse] = await Promise.all([
            fetch(API_URL + "/jobs"),
            fetch(API_URL + "/applications", {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("studentToken")
                }
            })
        ]);

        if (!jobsResponse.ok || !applicationsResponse.ok) {
            throw new Error("Could not load dashboard data.");
        }

        const allJobs = await jobsResponse.json();
        const allApplications = await applicationsResponse.json();

        // Keep only this student's applications
        const myApplications = allApplications.filter(function (application) {
            return application.studentEmail === currentStudent.email;
        });

        // ---------- Application statistics ----------

        const totalApplications = myApplications.length;

        const shortlistedCount = myApplications.filter(function (application) {
            return application.status === "Shortlisted";
        }).length;

        const interviewCount = myApplications.filter(function (application) {
            return application.status === "Interview";
        }).length;

        const selectedCount = myApplications.filter(function (application) {
            return application.status === "Selected";
        }).length;

        const statsRow = document.getElementById("statsRow");

        statsRow.innerHTML = `
            <div class="card stat-card">
                <h4>Total Applications</h4>
                <p>${totalApplications}</p>
            </div>

            <div class="card stat-card">
                <h4>Shortlisted</h4>
                <p>${shortlistedCount}</p>
            </div>

            <div class="card stat-card">
                <h4>Interview</h4>
                <p>${interviewCount}</p>
            </div>

            <div class="card stat-card">
                <h4>Selected</h4>
                <p>${selectedCount}</p>
            </div>
        `;

        // ---------- Placement eligibility ----------

        function isEligible(student, job) {
            const branchEligible = Array.isArray(job.branches) &&
                job.branches.includes(student.branch);

            const cgpaEligible = Number(student.cgpa) >= Number(job.minCGPA);

            return branchEligible && cgpaEligible;
        }

        const eligibleJobs = allJobs.filter(function (job) {
            return isEligible(currentStudent, job);
        });

        const eligibilitySnapshot = document.getElementById(
            "eligibilitySnapshot"
        );

        eligibilitySnapshot.innerHTML = `
            <h4>Placement Eligibility</h4>
            <p>Eligible for ${eligibleJobs.length} of ${allJobs.length} postings</p>
        `;

        // ---------- Upcoming job deadlines ----------

        // MongoDB job IDs use _id, not id
        const appliedJobIds = myApplications.map(function (application) {
            return String(application.jobId);
        });

        const availableJobs = allJobs.filter(function (job) {
            const notApplied = !appliedJobIds.includes(String(job._id));
            const eligible = isEligible(currentStudent, job);

            return notApplied && eligible;
        });

        availableJobs.sort(function (a, b) {
            return new Date(a.deadline) - new Date(b.deadline);
        });

        const upcomingJobs = availableJobs.slice(0, 3);
        const upcomingDeadlines = document.getElementById("upcomingDeadlines");

        upcomingDeadlines.replaceChildren();

        upcomingJobs.forEach(function (job) {
            const card = document.createElement("div");
            card.className = "card";

            const company = document.createElement("h4");
            company.textContent = job.company;

            const role = document.createElement("p");
            role.textContent = job.role;

            const deadline = document.createElement("p");
            deadline.textContent =
                "Deadline: " + new Date(job.deadline).toLocaleDateString();

            card.appendChild(company);
            card.appendChild(role);
            card.appendChild(deadline);

            upcomingDeadlines.appendChild(card);
        });

    } catch (error) {
        console.error("Dashboard loading error:", error);
        alert("Could not load dashboard data. Please check your connection.");
    }
}

// Load dashboard data
loadDashboard();

// Handle logout
document.getElementById("logoutBtn").addEventListener("click", function (e) {
    e.preventDefault();
    logout();
});
