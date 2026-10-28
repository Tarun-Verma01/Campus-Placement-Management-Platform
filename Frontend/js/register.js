
function getElements() {
    return {
        branchEl: document.getElementById("branch"),
        registerForm: document.getElementById("registrationForm"),
        nameEl: document.getElementById("name"),
        emailEl: document.getElementById("email"),
        passwordEl: document.getElementById("password"),
        confirmEl: document.getElementById("confirmPassword"),
        cgpaEl: document.getElementById("cgpa"),
        otherSkillEl: document.getElementById("otherSkill")
    };
}

// Show skills according to selected branch
function handleBranchChange() {
    var els = getElements();

    els.branchEl.addEventListener("change", function () {
        var branch = els.branchEl.value;
        var showId = "";

        if (branch === "CSE" || branch === "IT") {
            showId = "skillsCSE";
        } else if (branch === "ECE") {
            showId = "skillsECE";
        } else if (branch === "EE") {
            showId = "skillsEE";
        } else if (branch === "ME") {
            showId = "skillsME";
        } else if (branch === "Civil") {
            showId = "skillsCivil";
        }

        var all = [
            "skillsCSE",
            "skillsECE",
            "skillsEE",
            "skillsME",
            "skillsCivil"
        ];

        for (var i = 0; i < all.length; i++) {
            var el = document.getElementById(all[i]);

            if (el) {
                el.style.display = all[i] === showId ? "block" : "none";
            }
        }
    });
}

// Collect selected skills
function collectSkills() {
    var els = getElements();
    var branch = els.branchEl.value;
    var visibleId = "";

    if (branch === "CSE" || branch === "IT") {
        visibleId = "skillsCSE";
    } else if (branch === "ECE") {
        visibleId = "skillsECE";
    } else if (branch === "EE") {
        visibleId = "skillsEE";
    } else if (branch === "ME") {
        visibleId = "skillsME";
    } else if (branch === "Civil") {
        visibleId = "skillsCivil";
    }

    var skills = [];
    var group = document.getElementById(visibleId);

    if (group) {
        var inputs = group.getElementsByTagName("input");

        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type === "checkbox" && inputs[i].checked) {
                skills.push(inputs[i].value);
            }
        }
    }

    var other = els.otherSkillEl.value.trim();

    if (other !== "") {
        skills.push(other);
    }

    return skills;
}

// Register student through backend API
function handleRegister() {
    var els = getElements();

    els.registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        var name = els.nameEl.value.trim();
        var email = els.emailEl.value.trim();
        var password = els.passwordEl.value;
        var confirm = els.confirmEl.value;
        var branch = els.branchEl.value;
        var cgpaRaw = els.cgpaEl.value;

        // Validate required fields
        if (
            !name ||
            !email ||
            !password ||
            !confirm ||
            !branch ||
            cgpaRaw === ""
        ) {
            alert("Please fill all required fields.");
            return;
        }

        if (password !== confirm) {
            alert("Password and Confirm Password do not match.");
            return;
        }

        var cgpa = parseFloat(cgpaRaw);

        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
            alert("Please enter a valid CGPA between 0 and 10.");
            return;
        }

        var skills = collectSkills();

        // Send student data to backend
        try {
            var response = await fetch(
                "http://localhost:5000/api/students/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        branch: branch,
                        cgpa: cgpa,
                        skills: skills
                    })
                }
            );

            var data = await response.json();

            if (!response.ok) {
                alert(data.message || "Registration failed.");
                return;
            }

            // alert("Registration successful!");
            window.location.href = "login.html";

        } catch (error) {
            console.error("Registration error:", error);
            alert(
                "Could not connect to the server. Make sure the backend is running."
            );
        }
    });
}

// Initialize registration page
function init() {
    handleBranchChange();
    handleRegister();
}

init();
