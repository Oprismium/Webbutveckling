// ============================================================
// SCRIPT.JS — MASTER RENDER CONTROLLER
// Handles theme lifecycle safely
// ============================================================

// ----------------------
// SIDEBAR
// ----------------------
const sidebar = document.getElementById("sidebar");
let hideTimeout;

document.addEventListener("mousemove", (e) => {
    if (e.clientX < 80) sidebar?.classList.add("visible");
});

sidebar?.addEventListener("mouseleave", () => {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => sidebar?.classList.remove("visible"), 100);
});

// ----------------------
// THEME UI
// ----------------------
const themeToggle = document.getElementById("theme-toggle");
const themeDropdown = document.getElementById("theme-dropdown");

themeToggle?.addEventListener("click", () => {
    themeDropdown.classList.toggle("show");
});

window.addEventListener("click", (e) => {
    if (!e.target.matches("#theme-toggle")) {
        themeDropdown?.classList.remove("show");
    }
});

// ----------------------
// THEMES
// ONLY ONE ACTIVE AT A TIME
// ----------------------
const themes = {
    world: "./js/world.js"
};

let currentScript = null;
let currentStop = null;

// ----------------------
// SAFE THEME SWITCH
// ----------------------
function setTheme(name) {

    // STOP OLD ENGINE
    if (currentStop) {
        try { currentStop(); } catch (e) {}
        currentStop = null;
    }

    // REMOVE OLD SCRIPT
    if (currentScript) {
        document.head.removeChild(currentScript);
        currentScript = null;
    }

    // CLEAR CANVASES (IMPORTANT)
    const canvas = document.getElementById("themeCanvas");
    const fg = document.getElementById("foregroundCanvas");

    if (canvas) {
        const c = canvas.getContext("2d");
        c.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (fg) {
        const f = fg.getContext("2d");
        f.clearRect(0, 0, fg.width, fg.height);
    }

    // LOAD NEW ENGINE
    const script = document.createElement("script");
    script.src = themes[name];
    script.defer = true;

    script.onload = () => {
        currentStop = window.currentThemeAnimation?.stop || null;
    };

    document.head.appendChild(script);
    currentScript = script;

    // BODY CLASS
    document.body.className = "";
    document.body.classList.add(`${name}-theme`);
}

// ----------------------
// BUTTON BINDING
// ----------------------
document.querySelectorAll(".theme-option").forEach(btn => {
    btn.addEventListener("click", (e) => {
        setTheme(e.target.dataset.theme);
    });
});

// ----------------------
// INIT
// ----------------------
window.onload = () => {
    setTheme("world");
};

// ----------------------
// PARALLAX FOREGROUND
// ----------------------
window.addEventListener("scroll", () => {
    const fg = document.getElementById("foregroundCanvas");
    if (!fg) return;

    fg.style.transform = `translateY(-${window.scrollY}px)`;
});