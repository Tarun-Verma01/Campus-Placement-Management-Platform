const currentStudent = authGuard();

if (currentStudent) {
    const API_URL = "https://placementhub-api-crl7.onrender.com/api/students";

    const nameElement = document.getElementById("viewName");
    const emailElement = document.getElementById("viewEmail");
    const branchElement = document.getElementById("viewBranch");
    const cgpaElement = document.getElementById("viewCgpa");
    const skillsElement = document.getElementById("viewSkills");

    const profileView = document.getElementById("profileView");
    const profileEdit = document.getElementById("profileEdit");
    const editProfileBtn = document.getElementById("editProfileBtn");

    const editName = document.getElementById("editName");
    const editEmail = document.getElementById("editEmail");
    const editBranch = document.getElementById("editBranch");
    const editCgpa = document.getElementById("editCgpa");
    const editSkills = document.getElementById("editSkills");

    const profileForm = document.getElementById("profileForm");
    const cancelEditBtn = document.getElementById("cancelEditBtn");

    // Display student details
    function showProfile(student) {
        nameElement.textContent = student.name;
        emailElement.textContent = student.email;
        branchElement.textContent = student.branch;
        cgpaElement.textContent = student.cgpa;
        skillsElement.textContent = (student.skills || []).join(", ");
    }

    showProfile(currentStudent);

    // Open edit form
    editProfileBtn.addEventListener("click", function () {
        editName.value = currentStudent.name;
        editEmail.value = currentStudent.email;
        editBranch.value = currentStudent.branch;
        editCgpa.value = currentStudent.cgpa;
        editSkills.value = (currentStudent.skills || []).join(", ");

        profileView.style.display = "none";
        profileEdit.style.display = "block";
    });

    // Save changes to MongoDB
    profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const updatedName = editName.value.trim();
        const updatedBranch = editBranch.value;
        const updatedCgpa = Number(editCgpa.value);

        const updatedSkills = editSkills.value
            .split(",")
            .map(skill => skill.trim())
            .filter(skill => skill !== "");

        if (!updatedName || !updatedBranch) {
            alert("Name and branch are required.");
            return;
        }

        if (
            editCgpa.value.trim() === "" ||
            !Number.isFinite(updatedCgpa) ||
            updatedCgpa < 0 ||
            updatedCgpa > 10
        ) {
            alert("CGPA must be between 0 and 10.");
            return;
        }

        if (!currentStudent._id) {
            alert("Student ID is missing. Please log in again.");
            return;
        }

        const saveButton = profileForm.querySelector(
            'button[type="submit"]'
        );

        if (saveButton) {
            saveButton.disabled = true;
        }

        try {
            const response = await fetch(
                API_URL + "/" +
                encodeURIComponent(currentStudent._id) + "/profile",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem("studentToken")
                    },
                    body: JSON.stringify({
                        name: updatedName,
                        branch: updatedBranch,
                        cgpa: updatedCgpa,
                        skills: updatedSkills
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not update profile."
                );
            }

            // Update the current browser copy only after MongoDB succeeds
            Object.assign(currentStudent, data.student);

            localStorage.setItem(
                "currentStudent",
                JSON.stringify(currentStudent)
            );

            showProfile(currentStudent);

            profileEdit.style.display = "none";
            profileView.style.display = "block";

            alert("Profile updated successfully.");

        } catch (error) {
            console.error("Profile update error:", error);
            alert("Could not update profile: " + error.message);
        } finally {
            if (saveButton) {
                saveButton.disabled = false;
            }
        }
    });

    // Cancel editing
    cancelEditBtn.addEventListener("click", function () {
        profileEdit.style.display = "none";
        profileView.style.display = "block";
    });
}
