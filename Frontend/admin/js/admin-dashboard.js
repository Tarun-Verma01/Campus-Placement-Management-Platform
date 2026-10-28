// Backend API address
const API_URL = "http://localhost:5000/api";

// Store data received from MongoDB
let students = [];
let jobs = [];

// Allowed application statuses
const APPLICATION_STATUSES = [
    "Applied",
    "Shortlisted",
    "Selected",
    "Rejected"
];


// ==========================================
// 1. GET ADMIN TOKEN
// ==========================================

function getAdminToken() {
    return localStorage.getItem("adminToken");
}


// ==========================================
// 2. DASHBOARD STATISTICS
// ==========================================

async function showStats() {
    try {
        // Fetch all jobs
        const jobResponse = await fetch(API_URL + "/jobs");

        if (!jobResponse.ok) {
            throw new Error("Could not load jobs.");
        }

        const allJobs = await jobResponse.json();

        // Fetch all applications using admin token
        const applicationResponse = await fetch(
            API_URL + "/applications",
            {
                headers: {
                    Authorization: "Bearer " + getAdminToken()
                }
            }
        );

        if (!applicationResponse.ok) {
            throw new Error("Could not load applications.");
        }

        const applications = await applicationResponse.json();

        // Count unique companies
        const companies = [];

        allJobs.forEach(function (job) {
            if (!companies.includes(job.company)) {
                companies.push(job.company);
            }
        });

        // Prepare dashboard statistics
        const statistics = [
            {
                label: "Registered Students",
                value: students.length
            },
            {
                label: "Jobs Posted",
                value: allJobs.length
            },
            {
                label: "Companies",
                value: companies.length
            },
            {
                label: "Applications",
                value: applications.length
            }
        ];

        // Display statistics
        const statsRow = document.getElementById("statsRow");

        statsRow.innerHTML = statistics.map(function (stat) {
            return `
                <div class="stat-card">
                    <h4>${stat.label}</h4>
                    <p>${stat.value}</p>
                </div>
            `;
        }).join("");

        // Display application table
        showApplications(applications);

    } catch (error) {
        console.error("Dashboard statistics error:", error);

        alert(
            "Could not load dashboard statistics: " +
            error.message
        );
    }
}


// ==========================================
// 3. APPLICATION MANAGEMENT
// ==========================================

function showApplications(applications) {
    const tableBody = document.getElementById("applicationsBody");
    const emptyMessage = document.getElementById("applicationsEmpty");
    const errorMessage = document.getElementById("applicationsError");

    tableBody.replaceChildren();
    errorMessage.style.display = "none";

    applications.forEach(function (application) {
        const row = document.createElement("tr");

        // Display application information
        const values = [
            application.studentEmail,
            application.company,
            application.role,
            formatApplicationDate(application.appliedAt)
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value || "—";
            row.appendChild(cell);
        });

        // Display current status
        const statusCell = document.createElement("td");
        statusCell.className = "application-current-status";
        statusCell.textContent = application.status || "—";

        row.appendChild(statusCell);

        // Create status dropdown
        const actionCell = document.createElement("td");
        const statusDropdown = document.createElement("select");

        statusDropdown.className = "application-status";

        APPLICATION_STATUSES.forEach(function (status) {
            const option = document.createElement("option");

            option.value = status;
            option.textContent = status;

            statusDropdown.appendChild(option);
        });

        statusDropdown.value = APPLICATION_STATUSES.includes(
            application.status
        ) ? application.status : "Applied";

        // Create update button
        const updateButton = document.createElement("button");

        updateButton.type = "button";
        updateButton.className = "btn btn-small";
        updateButton.textContent = "Update";
        updateButton.dataset.applicationId = application._id || "";
        updateButton.disabled = !application._id;

        actionCell.appendChild(statusDropdown);
        actionCell.appendChild(updateButton);

        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });

    emptyMessage.style.display =
        applications.length === 0 ? "block" : "none";
}


// Format application date
function formatApplicationDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString();
}


// Display application errors
function showApplicationsError(message) {
    const errorElement = document.getElementById("applicationsError");

    errorElement.textContent =
        "Could not load applications: " + message;

    errorElement.style.display = "block";
}


// Update application status
async function updateApplicationStatus(button) {
    const row = button.closest("tr");

    const dropdown = row.querySelector(".application-status");
    const statusCell = row.querySelector(".application-current-status");

    const applicationId = button.dataset.applicationId;
    const selectedStatus = dropdown.value;

    button.disabled = true;

    try {
        const response = await fetch(
            API_URL + "/applications/" + applicationId,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + getAdminToken()
                },

                body: JSON.stringify({
                    status: selectedStatus
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Could not update application."
            );
        }

        // Update the table after server confirmation
        statusCell.textContent = data.status;

    } catch (error) {
        alert(
            "Could not update application status: " +
            error.message
        );
    } finally {
        button.disabled = false;
    }
}


// ==========================================
// 4. JOB MANAGEMENT
// ==========================================

// Fetch all jobs
async function loadJobs() {
    const tableBody = document.getElementById("jobsBody");
    const emptyMessage = document.getElementById("jobsEmpty");
    const errorElement = document.getElementById("jobsError");

    errorElement.style.display = "none";

    try {
        const response = await fetch(API_URL + "/jobs");

        if (!response.ok) {
            throw new Error("Could not load jobs.");
        }

        jobs = await response.json();

        if (!Array.isArray(jobs)) {
            throw new Error("Invalid job data.");
        }

        showJobs();

    } catch (error) {
        console.error("Job loading error:", error);

        tableBody.replaceChildren();
        emptyMessage.style.display = "none";

        errorElement.textContent =
            "Could not load jobs: " + error.message;

        errorElement.style.display = "block";
    }
}


// Display jobs in the table
function showJobs() {
    const tableBody = document.getElementById("jobsBody");
    const emptyMessage = document.getElementById("jobsEmpty");

    tableBody.replaceChildren();

    jobs.forEach(function (job) {
        const row = document.createElement("tr");

        const values = [
            job.company,
            job.role,
            job.location,
            job.salary,
            job.minCGPA,
            Array.isArray(job.branches)
                ? job.branches.join(", ")
                : "—",
            formatJobDate(job.deadline)
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");

            cell.textContent = value ?? "—";

            row.appendChild(cell);
        });

        // Edit button
        const actionCell = document.createElement("td");
        actionCell.className = "actions";

        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "btn btn-small";
        editButton.textContent = "Edit";
        editButton.dataset.editJobId = job._id || "";

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className =
            "btn btn-danger btn-small job-delete-btn";

        deleteButton.textContent = "Delete";
        deleteButton.dataset.deleteJobId = job._id || "";

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });

    emptyMessage.style.display =
        jobs.length === 0 ? "block" : "none";
}


// Format job deadline
function formatJobDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString();
}


// Display a message below the job form
function showJobFormMessage(message, isError) {
    const messageElement = document.getElementById("jobFormMessage");

    messageElement.textContent = message;

    messageElement.className = isError
        ? "form-message form-message-error"
        : "form-message form-message-success";

    messageElement.style.display = "block";
}


// Reset job form
function resetJobForm() {
    document.getElementById("jobForm").reset();
    document.getElementById("jobId").value = "";

    document.getElementById("jobFormTitle").textContent = "Add New Job";
    document.getElementById("saveJobBtn").textContent = "Add Job";

    document.getElementById("cancelJobEditBtn").style.display = "none";
    document.getElementById("jobFormMessage").style.display = "none";
}


// Load existing job details into the form
function editJob(jobId) {
    const job = jobs.find(function (item) {
        return item._id === jobId;
    });

    if (!job) {
        return;
    }

    document.getElementById("jobId").value = job._id;
    document.getElementById("jobCompany").value = job.company || "";
    document.getElementById("jobRole").value = job.role || "";
    document.getElementById("jobLocation").value = job.location || "";
    document.getElementById("jobSalary").value = job.salary || "";

    document.getElementById("jobMinCGPA").value =
        job.minCGPA ?? "";

    document.getElementById("jobDeadline").value = job.deadline
        ? new Date(job.deadline).toISOString().slice(0, 10)
        : "";

    document.getElementById("jobBranches").value =
        Array.isArray(job.branches)
            ? job.branches.join(", ")
            : "";

    document.getElementById("jobSkills").value =
        Array.isArray(job.requiredSkills)
            ? job.requiredSkills.join(", ")
            : "";

    document.getElementById("jobFormTitle").textContent = "Edit Job";
    document.getElementById("saveJobBtn").textContent = "Save Changes";

    document.getElementById("cancelJobEditBtn").style.display =
        "inline-block";

    document.getElementById("jobFormMessage").style.display = "none";

    document.getElementById("jobManagement").scrollIntoView({
        behavior: "smooth"
    });
}


// Add a new job or update an existing job
async function saveJob(event) {
    event.preventDefault();

    const token = getAdminToken();
    const jobId = document.getElementById("jobId").value;

    // Collect values from the form
    const job = {
        company: document.getElementById("jobCompany").value.trim(),
        role: document.getElementById("jobRole").value.trim(),
        location: document.getElementById("jobLocation").value.trim(),
        salary: document.getElementById("jobSalary").value.trim(),

        minCGPA: Number(
            document.getElementById("jobMinCGPA").value
        ),

        deadline: document.getElementById("jobDeadline").value,

        branches: document.getElementById("jobBranches").value
            .split(",")
            .map(function (branch) {
                return branch.trim();
            })
            .filter(Boolean),

        requiredSkills: document.getElementById("jobSkills").value
            .split(",")
            .map(function (skill) {
                return skill.trim();
            })
            .filter(Boolean)
    };

    if (job.branches.length === 0) {
        showJobFormMessage(
            "Enter at least one eligible branch.",
            true
        );

        return;
    }

    const saveButton = document.getElementById("saveJobBtn");
    saveButton.disabled = true;

    try {
        let url = API_URL + "/jobs";
        let method = "POST";

        // If jobId exists, update that job instead
        if (jobId) {
            url = API_URL + "/jobs/" + jobId;
            method = "PUT";
        }

        const response = await fetch(url, {
            method: method,

            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },

            body: JSON.stringify(job)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not save job.");
        }

        showJobFormMessage(
            jobId
                ? "Job updated successfully."
                : "Job added successfully.",
            false
        );

        resetJobForm();

        await loadJobs();
        await showStats();

    } catch (error) {
        showJobFormMessage(error.message, true);

    } finally {
        saveButton.disabled = false;
    }
}


// Delete a job
async function deleteJob(jobId) {
    const job = jobs.find(function (item) {
        return item._id === jobId;
    });

    if (!job) {
        return;
    }

    const confirmed = confirm(
        "Delete the job at " +
        job.company +
        " for " +
        job.role +
        "?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            API_URL + "/jobs/" + jobId,
            {
                method: "DELETE",

                headers: {
                    Authorization: "Bearer " + getAdminToken()
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not delete job.");
        }

        await loadJobs();
        await showStats();

        showJobFormMessage("Job deleted successfully.", false);

    } catch (error) {
        showJobFormMessage(error.message, true);
    }
}


// ==========================================
// 5. STUDENT MANAGEMENT
// ==========================================

// Fetch all students from the backend
async function loadStudents() {
    try {
        const response = await fetch(API_URL + "/students", {
            headers: {
                Authorization: "Bearer " + getAdminToken()
            }
        });

        if (!response.ok) {
            throw new Error("Could not load students.");
        }

        students = await response.json();

        if (!Array.isArray(students)) {
            throw new Error("Invalid student data.");
        }

        showStudents();
        showBranchTable();

    } catch (error) {
        console.error("Student loading error:", error);

        alert("Could not load students: " + error.message);

        throw error;
    }
}


// Check whether a student is blocked
function isBlocked(student) {
    return student.blocked === true;
}


// Display all students
function showStudents() {
    const tableBody = document.getElementById("studentsBody");
    const emptyMessage = document.getElementById("studentsEmpty");

    tableBody.replaceChildren();

    students.forEach(function (student) {
        const row = document.createElement("tr");
        const blocked = isBlocked(student);

        if (blocked) {
            row.className = "row-blocked";
        }

        const values = [
            student.name,
            student.email,
            student.branch,
            student.cgpa
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");

            cell.textContent = value ?? "—";

            row.appendChild(cell);
        });

        // Show student account status
        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        statusBadge.className = blocked
            ? "badge badge-blocked"
            : "badge badge-active";

        statusBadge.textContent = blocked ? "Blocked" : "Active";

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        // Create block/unblock button
        const actionCell = document.createElement("td");
        actionCell.className = "actions";

        const button = document.createElement("button");

        button.type = "button";

        button.className = blocked
            ? "btn btn-outline btn-small"
            : "btn btn-danger btn-small";

        button.textContent = blocked ? "Unblock" : "Block";
        button.dataset.studentId = student._id;

        actionCell.appendChild(button);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });

    emptyMessage.style.display =
        students.length === 0 ? "block" : "none";
}


// Block or unblock a student
async function toggleBlock(studentId) {
    const student = students.find(function (item) {
        return item._id === studentId;
    });

    if (!student) {
        return;
    }

    // Reverse the current blocked status
    const newBlockedStatus = !isBlocked(student);

    try {
        const response = await fetch(
            API_URL + "/students/" + studentId + "/block",
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + getAdminToken()
                },

                body: JSON.stringify({
                    blocked: newBlockedStatus
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Could not update student status."
            );
        }

        // Replace the old student data with the updated data
        students = students.map(function (item) {
            if (item._id === studentId) {
                return data.student;
            }

            return item;
        });

        showStudents();

    } catch (error) {
        alert("Could not update student status: " + error.message);
    }
}


// ==========================================
// 6. BRANCH DISTRIBUTION
// ==========================================

function showBranchTable() {
    const tableBody = document.getElementById("branchBody");
    const emptyMessage = document.getElementById("branchEmpty");

    // Count students in each branch
    const branchCounts = {};

    students.forEach(function (student) {
        const branch = student.branch || "Not set";

        if (branchCounts[branch] === undefined) {
            branchCounts[branch] = 0;
        }

        branchCounts[branch]++;
    });

    const branches = Object.keys(branchCounts).sort();

    tableBody.replaceChildren();

    branches.forEach(function (branch) {
        const count = branchCounts[branch];

        const percentage = students.length > 0
            ? Math.round((count / students.length) * 100)
            : 0;

        const row = document.createElement("tr");

        const branchCell = document.createElement("td");
        branchCell.textContent = branch;

        const countCell = document.createElement("td");
        countCell.textContent = count;

        const percentageCell = document.createElement("td");
        percentageCell.textContent = percentage + "%";

        // Create percentage bar
        const barTrack = document.createElement("div");
        barTrack.className = "bar-track";

        const barFill = document.createElement("span");
        barFill.className = "bar-fill";
        barFill.style.width = percentage + "%";

        barTrack.appendChild(barFill);
        percentageCell.appendChild(barTrack);

        row.appendChild(branchCell);
        row.appendChild(countCell);
        row.appendChild(percentageCell);

        tableBody.appendChild(row);
    });

    emptyMessage.style.display =
        branches.length === 0 ? "block" : "none";
}


// ==========================================
// 7. START DASHBOARD
// ==========================================

async function initDashboard() {
    // Check whether the admin is logged in
    const currentAdmin = adminAuthGuard();

    if (!currentAdmin) {
        return;
    }

    try {
        await loadStudents();
        await loadJobs();
        await showStats();

    } catch (error) {
        console.error("Dashboard initialization failed:", error);
    }
}


// Start the dashboard
initDashboard();


// ==========================================
// 8. BUTTON EVENT LISTENERS
// ==========================================

// Handle student block/unblock buttons
document.getElementById("studentsBody").addEventListener(
    "click",
    function (event) {
        const button = event.target.closest("button[data-student-id]");

        if (button) {
            toggleBlock(button.dataset.studentId);
        }
    }
);


// Handle application status update buttons
document.getElementById("applicationsBody").addEventListener(
    "click",
    function (event) {
        const button = event.target.closest(
            "button[data-application-id]"
        );

        if (button) {
            updateApplicationStatus(button);
        }
    }
);


// Handle job form submission and job buttons
document.getElementById("jobForm").addEventListener(
    "submit",
    saveJob
);

document.getElementById("cancelJobEditBtn").addEventListener(
    "click",
    resetJobForm
);

document.getElementById("jobsBody").addEventListener(
    "click",
    function (event) {
        const editButton = event.target.closest(
            "button[data-edit-job-id]"
        );

        const deleteButton = event.target.closest(
            "button[data-delete-job-id]"
        );

        if (editButton) {
            editJob(editButton.dataset.editJobId);
        }

        if (deleteButton) {
            deleteJob(deleteButton.dataset.deleteJobId);
        }
    }
);