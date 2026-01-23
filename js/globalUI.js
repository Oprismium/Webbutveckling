/* ================= SIDEBAR ================= */

function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    document.addEventListener("mousemove", e => {
        if (e.clientX < 50) sidebar.classList.add("visible");
    });

    sidebar.addEventListener("mouseleave", () => {
        sidebar.classList.remove("visible");
    });
}

<<<<<<< HEAD

=======
>>>>>>> 0dc8466bee2c78718d1438c08efbe9439b14d66a
/* ================= THEME SYSTEM ================= */

const themes = {
    realTheme: "/js/realTheme.js",
    twilight: "/js/twilight.js",
    onyx: "/js/onyx.js",
    dawn: "/js/dawn.js",
    matrix: "/js/matrix.js"
};

let currentScript = null;
let currentController = null;

function setTheme(theme) {
    if (!themes[theme]) return;

    localStorage.setItem("selectedTheme", theme);

    if (currentController && typeof currentController.stop === "function") {
        currentController.stop();
        currentController = null;
    }

    if (currentScript) {
        currentScript.remove();
        currentScript = null;
    }

    const script = document.createElement("script");
    script.src = themes[theme];
    script.defer = true;
    document.head.appendChild(script);
    currentScript = script;

    document.body.className = theme + "-theme";
}

function initThemeControls() {
    const toggle = document.getElementById("theme-toggle");
    const dropdown = document.getElementById("theme-dropdown");
    if (!toggle || !dropdown) return;

    toggle.addEventListener("click", e => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => {
        dropdown.classList.remove("show");
    });

    document.querySelectorAll(".theme-option").forEach(btn => {
        btn.addEventListener("click", () => {
            setTheme(btn.dataset.theme);
        });
    });
}

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    initThemeControls();
    setTheme(localStorage.getItem("selectedTheme") || "realTheme");
});