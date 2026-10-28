document.addEventListener("DOMContentLoaded", function () {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    const yearElement = document.getElementById("year");

    // Keep the footer year current.
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Open and close the mobile navigation menu.
    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            const isOpen = navLinks.classList.toggle("show");

            navToggle.setAttribute("aria-expanded", String(isOpen));
            navToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation" : "Open navigation"
            );
        });

        // Close the menu after selecting a section.
        navLinks.querySelectorAll('a[data-scroll]').forEach(function (link) {
            link.addEventListener("click", function () {
                navLinks.classList.remove("show");
                navToggle.setAttribute("aria-expanded", "false");
                navToggle.setAttribute("aria-label", "Open navigation");
            });
        });

        // Close the menu when Escape is pressed.
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                navLinks.classList.remove("show");
                navToggle.setAttribute("aria-expanded", "false");
                navToggle.setAttribute("aria-label", "Open navigation");
            }
        });
    }

    // Smooth scrolling for homepage section links.
    document.querySelectorAll('a[data-scroll][href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            const targetId = link.getAttribute("href").slice(1);
            const target = document.getElementById(targetId);

            if (target) {
                event.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
});
