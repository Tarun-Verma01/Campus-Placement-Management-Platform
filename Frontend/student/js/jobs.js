const currentStudent = authGuard();

const API_URL = "http://localhost:5000/api";

let allJobs = [];

// Check whether the student meets job eligibility requirements
function isEligible(student, job) {
    const branchEligible =
        Array.isArray(job.branches) &&
        job.branches.includes(student.branch);

    const cgpaEligible =
        Number(student.cgpa) >= Number(job.minCGPA);

    return branchEligible && cgpaEligible;
}

// Calculate the percentage of required skills the student has
function calculateSkillMatch(student, job) {
    const requiredSkills = job.requiredSkills || [];
    const studentSkills = student.skills || [];

    if (requiredSkills.length === 0) {
        return 100;
    }

    let matchedSkills = 0;

    requiredSkills.forEach(function (skill) {
        if (studentSkills.includes(skill)) {
            matchedSkills++;
        }
    });

    return Math.round(
        (matchedSkills / requiredSkills.length) * 100
    );
}

// Render job cards
function renderJobs() {
    const jobsContainer = document.getElementById("jobsContainer");

    jobsContainer.replaceChildren();

    if (allJobs.length === 0) {
        jobsContainer.textContent = "No jobs are currently available.";
        return;
    }

    allJobs.forEach(function (job) {
        const eligible = isEligible(currentStudent, job);
        const skillMatch = calculateSkillMatch(currentStudent, job);

        const statusClass = eligible
            ? "status-eligible"
            : "status-not-eligible";

        const statusText = eligible
            ? "Eligible"
            : "Not Eligible";

        const jobCard = document.createElement("article");
        jobCard.className = "job-card";

        jobCard.innerHTML = `
            <div class="job-card-header">
                <div>
                    <h3 class="job-company"></h3>
                    <p class="job-role"></p>
                </div>

                <span class="status-badge ${statusClass}">
                    <span class="status-dot" aria-hidden="true"></span>
                    ${statusText}
                </span>
            </div>

            <div class="job-meta-row">
                <span class="job-meta-item job-location"></span>
                <span class="job-meta-item job-salary"></span>
            </div>

            <hr class="job-divider">

            <div class="job-details">
                <div class="job-detail-row">
                    <span class="detail-label">Min. CGPA</span>
                    <span class="detail-value job-min-cgpa"></span>
                </div>

                <div class="job-detail-row">
                    <span class="detail-label">Branches</span>
                    <div class="branch-tags"></div>
                </div>
            </div>

            <div class="job-skills">
                <div class="job-skills-label">Required Skills</div>
                <div class="skill-tags"></div>
            </div>

            <div class="skill-match-section">
                <div class="skill-match-header">
                    <span class="skill-match-label">Skill Match</span>
                    <span class="skill-match-value">${skillMatch}%</span>
                </div>

                <div
                    class="skill-match-bar"
                    role="progressbar"
                    aria-valuenow="${skillMatch}"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label="Skill match percentage"
                >
                    <div
                        class="skill-match-fill"
                        style="width: ${skillMatch}%"
                    ></div>
                </div>
            </div>

            <div class="job-card-footer">
                <span class="job-deadline"></span>
                <button type="button" class="btn-apply">
                    Apply Now
                </button>
            </div>
        `;

        // Fill job details
        jobCard.querySelector(".job-company").textContent =
            job.company || "—";

        jobCard.querySelector(".job-role").textContent =
            job.role || "—";

        jobCard.querySelector(".job-location").textContent =
            "📍 " + (job.location || "—");

        jobCard.querySelector(".job-salary").textContent =
            "💰 " + (job.salary || "—");

        jobCard.querySelector(".job-min-cgpa").textContent =
            job.minCGPA ?? "—";

        const branchTags = jobCard.querySelector(".branch-tags");

        (job.branches || []).forEach(function (branch) {
            const tag = document.createElement("span");
            tag.className = "branch-tag";
            tag.textContent = branch;
            branchTags.appendChild(tag);
        });

        const skillTags = jobCard.querySelector(".skill-tags");

        (job.requiredSkills || []).forEach(function (skill) {
            const tag = document.createElement("span");
            tag.className = "skill-tag";
            tag.textContent = skill;
            skillTags.appendChild(tag);
        });

        const deadline = jobCard.querySelector(".job-deadline");
        deadline.textContent = "Deadline: " + formatDeadline(job.deadline);

        const applyButton = jobCard.querySelector(".btn-apply");

        if (!eligible) {
            applyButton.disabled = true;
            applyButton.textContent = "Not Eligible";
        }

        applyButton.addEventListener("click", function () {
            applyForJob(job, applyButton);
        });

        jobsContainer.appendChild(jobCard);
    });
}

// Format deadline for display
function formatDeadline(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString();
}

// Submit application through the backend API
async function applyForJob(job, button) {
    if (!currentStudent || button.disabled) {
        return;
    }

    if (!isEligible(currentStudent, job)) {
        alert("You are not eligible for this job.");
        return;
    }

    if (!job._id) {
        alert("This job does not have a valid database ID.");
        return;
    }

    button.disabled = true;

    try {
        const response = await fetch(API_URL + "/applications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("studentToken")
            },
            body: JSON.stringify({
                studentEmail: currentStudent.email,
                jobId: job._id,
                company: job.company,
                role: job.role
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to submit application.");
            return;
        }

        alert("Application submitted successfully!");

    } catch (error) {
        console.error("Application error:", error);
        alert("Could not connect to the server.");
    } finally {
        button.disabled = false;
    }
}

// Fetch jobs from MongoDB
async function loadJobs() {
    if (!currentStudent) {
        return;
    }

    const jobsContainer = document.getElementById("jobsContainer");

    try {
        const response = await fetch(API_URL + "/jobs");

        if (!response.ok) {
            throw new Error("Could not load jobs.");
        }

        allJobs = await response.json();

        if (!Array.isArray(allJobs)) {
            throw new Error("Invalid job data received.");
        }

        renderJobs();

    } catch (error) {
        console.error("Job loading error:", error);
        jobsContainer.textContent =
            "Could not load jobs. Please check your connection.";
    }
}

// Start loading jobs
if (currentStudent) {
    loadJobs();
}
