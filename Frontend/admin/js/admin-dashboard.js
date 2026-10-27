
const API_URL = "http://localhost:5000/api";

const APPLICATION_STATUSES = [
    "Applied",
    "Shortlisted",
    "Selected",
    "Rejected"
];

let students = [];

// ---------- statistics ----------

async function showStats() {
    try {
        const jobResponse = await fetch(API_URL + "/jobs");

        if (!jobResponse.ok) {
            throw new Error("Could not load jobs.");
        }

        const jobs = await jobResponse.json();

        let applications = null;

        try {
            const response = await fetch(API_URL + "/applications");

            if (!response.ok) {
                throw new Error("Could not load applications.");
            }

            applications = await response.json();

            if (!Array.isArray(applications)) {
                throw new Error("Invalid application data.");
            }

            showApplications(applications);
        } catch (error) {
            showApplicationsError(error.message);
        }

        const companies = jobs
            .map(function (job) {
                return job.company;
            })
            .filter(function (name, index, all) {
                return all.indexOf(name) === index;
            });

        const cards = [
            { label: "Registered Students", value: students.length },
            { label: "Jobs Posted", value: jobs.length },
            { label: "Companies", value: companies.length },
            {
                label: "Applications",
                value: applications === null
                    ? "Unavailable"
                    : applications.length
            }
        ];

        document.getElementById("statsRow").innerHTML = cards.map(
            function (card) {
                return '<div class="stat-card"><h4>' +
                    card.label +
                    "</h4><p>" +
                    card.value +
                    "</p></div>";
            }
        ).join("");

    } catch (error) {
        console.error("Dashboard statistics error:", error);
        alert("Could not load dashboard statistics: " + error.message);
    }
}

// ---------- applications ----------

function showApplications(applications) {
    const body = document.getElementById("applicationsBody");
    const empty = document.getElementById("applicationsEmpty");
    const error = document.getElementById("applicationsError");

    body.replaceChildren();
    error.style.display = "none";

    applications.forEach(function (application) {
        const row = document.createElement("tr");

        [
            application.studentEmail,
            application.company,
            application.role,
            formatApplicationDate(application.appliedAt)
        ].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value || "—";
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        statusCell.className = "application-current-status";
        statusCell.textContent = application.status || "—";
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "application-actions";

        const statusSelect = document.createElement("select");
        statusSelect.className = "application-status";
        statusSelect.setAttribute(
            "aria-label",
            "Select application status"
        );

        APPLICATION_STATUSES.forEach(function (status) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });

        statusSelect.value = APPLICATION_STATUSES.includes(
            application.status
        ) ? application.status : "Applied";

        const updateButton = document.createElement("button");
        updateButton.type = "button";
        updateButton.className = "btn btn-small";
        updateButton.textContent = "Update";
        updateButton.dataset.applicationId = application._id || "";
        updateButton.disabled = !application._id;

        actions.appendChild(statusSelect);
        actions.appendChild(updateButton);
        actionCell.appendChild(actions);
        row.appendChild(actionCell);
        body.appendChild(row);
    });

    empty.style.display = applications.length === 0 ? "block" : "none";
}

function formatApplicationDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString();
}

function showApplicationsError(message) {
    const error = document.getElementById("applicationsError");
    error.textContent = "Could not load applications: " + message;
    error.style.display = "block";
}

async function updateApplicationStatus(button) {
    const row = button.closest("tr");
    const statusSelect = row.querySelector(".application-status");
    const statusCell = row.querySelector(".application-current-status");
    const selectedStatus = statusSelect.value;
    const applicationId = button.dataset.applicationId;

    button.disabled = true;

    try {
        const response = await fetch(
            API_URL + "/applications/" +
            encodeURIComponent(applicationId),
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: selectedStatus })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Could not update application status."
            );
        }

        if (!data || data.status !== selectedStatus) {
            throw new Error("The server did not confirm the new status.");
        }

        statusCell.textContent = data.status;

    } catch (error) {
        alert("Could not update application status: " + error.message);
    } finally {
        button.disabled = false;
    }
}


// ---------- job management ----------

let jobs = [];

async function loadJobs() {
    const body = document.getElementById("jobsBody");
    const empty = document.getElementById("jobsEmpty");
    const error = document.getElementById("jobsError");

    error.style.display = "none";

    try {
        const response = await fetch(API_URL + "/jobs");

        if (!response.ok) {
            throw new Error("Could not load jobs.");
        }

        jobs = await response.json();

        if (!Array.isArray(jobs)) {
            throw new Error("Invalid job data received.");
        }

        showJobs();
    } catch (error) {
        console.error("Job loading error:", error);
        body.replaceChildren();
        empty.style.display = "none";
        errorMessage("Could not load jobs: " + error.message);
    }

    function errorMessage(message) {
        error.textContent = message;
        error.style.display = "block";
    }
}

function showJobs() {
    const body = document.getElementById("jobsBody");
    const empty = document.getElementById("jobsEmpty");

    body.replaceChildren();

    jobs.forEach(function (job) {
        const row = document.createElement("tr");

        [
            job.company,
            job.role,
            job.location,
            job.salary,
            job.minCGPA,
            Array.isArray(job.branches) ? job.branches.join(", ") : "—",
            formatJobDate(job.deadline)
        ].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value ?? "—";
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        actionCell.className = "actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-small";
        editButton.textContent = "Edit";
        editButton.dataset.editJobId = job._id || "";
        editButton.disabled = !job._id;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger btn-small job-delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.dataset.deleteJobId = job._id || "";
        deleteButton.disabled = !job._id;

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        body.appendChild(row);
    });

    empty.style.display = jobs.length === 0 ? "block" : "none";
}

function formatJobDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString();
}

function showJobFormMessage(message, isError) {
    const messageElement = document.getElementById("jobFormMessage");
    messageElement.textContent = message;
    messageElement.className = isError ? "form-message form-message-error" : "form-message form-message-success";
    messageElement.style.display = "block";
}

function resetJobForm() {
    document.getElementById("jobForm").reset();
    document.getElementById("jobId").value = "";
    document.getElementById("jobFormTitle").textContent = "Add New Job";
    document.getElementById("saveJobBtn").textContent = "Add Job";
    document.getElementById("cancelJobEditBtn").style.display = "none";
    document.getElementById("jobFormMessage").style.display = "none";
}

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
    document.getElementById("jobMinCGPA").value = job.minCGPA ?? "";
    document.getElementById("jobDeadline").value = job.deadline
        ? new Date(job.deadline).toISOString().slice(0, 10)
        : "";
    document.getElementById("jobBranches").value = Array.isArray(job.branches)
        ? job.branches.join(", ")
        : "";
    document.getElementById("jobSkills").value = Array.isArray(job.requiredSkills)
        ? job.requiredSkills.join(", ")
        : "";

    document.getElementById("jobFormTitle").textContent = "Edit Job";
    document.getElementById("saveJobBtn").textContent = "Save Changes";
    document.getElementById("cancelJobEditBtn").style.display = "inline-block";
    document.getElementById("jobFormMessage").style.display = "none";
    document.getElementById("jobManagement").scrollIntoView({ behavior: "smooth" });
}

async function saveJob(event) {
    event.preventDefault();

    const jobId = document.getElementById("jobId").value;
    const job = {
        company: document.getElementById("jobCompany").value.trim(),
        role: document.getElementById("jobRole").value.trim(),
        location: document.getElementById("jobLocation").value.trim(),
        salary: document.getElementById("jobSalary").value.trim(),
        minCGPA: Number(document.getElementById("jobMinCGPA").value),
        deadline: document.getElementById("jobDeadline").value,
        branches: document.getElementById("jobBranches").value
            .split(",").map(function (value) { return value.trim(); }).filter(Boolean),
        requiredSkills: document.getElementById("jobSkills").value
            .split(",").map(function (value) { return value.trim(); }).filter(Boolean)
    };

    if (job.branches.length === 0) {
        showJobFormMessage("Enter at least one eligible branch.", true);
        return;
    }

    const button = document.getElementById("saveJobBtn");
    button.disabled = true;

    try {
        const response = await fetch(
            API_URL + "/jobs" + (jobId ? "/" + encodeURIComponent(jobId) : ""),
            {
                method: jobId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(job)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not save job.");
        }

        showJobFormMessage(jobId ? "Job updated successfully." : "Job added successfully.", false);
        resetJobForm();
        await loadJobs();
        await showStats();
    } catch (error) {
        showJobFormMessage(error.message, true);
    } finally {
        button.disabled = false;
    }
}

async function deleteJob(jobId) {
    const job = jobs.find(function (item) {
        return item._id === jobId;
    });

    if (!job || !confirm("Delete the job at " + job.company + " for " + job.role + "?")) {
        return;
    }

    try {
        const response = await fetch(
            API_URL + "/jobs/" + encodeURIComponent(jobId),
            { method: "DELETE" }
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

// ---------- student management from MongoDB ----------

async function loadStudents() {
    try {
        const response = await fetch(API_URL + "/students");

        if (!response.ok) {
            throw new Error("Could not fetch students.");
        }

        students = await response.json();

        if (!Array.isArray(students)) {
            throw new Error("Invalid student data received.");
        }

        showStudents();
        showBranchTable();

    } catch (error) {
        console.error("Student loading error:", error);
        alert("Could not load students: " + error.message);
        throw error;
    }
}

function isBlocked(student) {
    return student.blocked === true;
}

function showStudents() {
    const body = document.getElementById("studentsBody");
    const empty = document.getElementById("studentsEmpty");

    body.replaceChildren();

    students.forEach(function (student) {
        const blocked = isBlocked(student);
        const row = document.createElement("tr");

        if (blocked) {
            row.className = "row-blocked";
        }

        [
            student.name,
            student.email,
            student.branch,
            student.cgpa
        ].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value ?? "—";
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");

        badge.className = blocked
            ? "badge badge-blocked"
            : "badge badge-active";

        badge.textContent = blocked ? "Blocked" : "Active";
        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");
        actionCell.className = "actions";

        const button = document.createElement("button");
        button.type = "button";
        button.className = blocked
            ? "btn btn-outline btn-small"
            : "btn btn-danger btn-small";

        button.textContent = blocked ? "Unblock" : "Block";
        button.dataset.studentId = student._id;
        button.disabled = !student._id;

        actionCell.appendChild(button);
        row.appendChild(actionCell);
        body.appendChild(row);
    });

    empty.style.display = students.length === 0 ? "block" : "none";
}

async function toggleBlock(studentId) {
    const student = students.find(function (item) {
        return item._id === studentId;
    });

    if (!student) {
        return;
    }

    const newBlockedStatus = !isBlocked(student);

    try {
        const response = await fetch(
            API_URL + "/students/" +
            encodeURIComponent(studentId) + "/block",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
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

        // Update the frontend only after MongoDB confirms the change.
        const updatedStudent = data.student;

        students = students.map(function (item) {
            return item._id === studentId ? updatedStudent : item;
        });

        showStudents();

    } catch (error) {
        alert("Could not update student status: " + error.message);
    }
}

// ---------- branch distribution ----------

function showBranchTable() {
    const body = document.getElementById("branchBody");
    const empty = document.getElementById("branchEmpty");

    const counts = students.reduce(function (result, student) {
        const branch = student.branch || "Not set";
        result[branch] = (result[branch] || 0) + 1;
        return result;
    }, {});

    const branches = Object.keys(counts).sort();

    body.replaceChildren();

    branches.forEach(function (branch) {
        const count = counts[branch];
        const share = students.length
            ? Math.round((count / students.length) * 100)
            : 0;

        const row = document.createElement("tr");

        const branchCell = document.createElement("td");
        branchCell.textContent = branch;

        const countCell = document.createElement("td");
        countCell.textContent = count;

        const shareCell = document.createElement("td");
        shareCell.appendChild(document.createTextNode(share + "%"));

        const track = document.createElement("div");
        track.className = "bar-track";

        const fill = document.createElement("span");
        fill.className = "bar-fill";
        fill.style.width = share + "%";

        track.appendChild(fill);
        shareCell.appendChild(track);

        row.appendChild(branchCell);
        row.appendChild(countCell);
        row.appendChild(shareCell);

        body.appendChild(row);
    });

    empty.style.display = students.length === 0 ? "block" : "none";
}

// ---------- page start ----------

async function initDashboard() {
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

initDashboard();

// One listener for student block/unblock actions.
document.getElementById("studentsBody").addEventListener(
    "click",
    function (event) {
        const button = event.target.closest("button[data-student-id]");

        if (button && button.dataset.studentId) {
            toggleBlock(button.dataset.studentId);
        }
    }
);

// One listener for application status updates.
document.getElementById("applicationsBody").addEventListener(
    "click",
    function (event) {
        const button = event.target.closest(
            "button[data-application-id]"
        );

        if (button && button.dataset.applicationId) {
            updateApplicationStatus(button);
        }
    }
);


// Job management form and actions.
document.getElementById("jobForm").addEventListener("submit", saveJob);
document.getElementById("cancelJobEditBtn").addEventListener("click", resetJobForm);
document.getElementById("jobsBody").addEventListener("click", function (event) {
    const editButton = event.target.closest("button[data-edit-job-id]");
    const deleteButton = event.target.closest("button[data-delete-job-id]");

    if (editButton && editButton.dataset.editJobId) {
        editJob(editButton.dataset.editJobId);
    }

    if (deleteButton && deleteButton.dataset.deleteJobId) {
        deleteJob(deleteButton.dataset.deleteJobId);
    }
});
