// ============================================================
// SCRIPT.JS — STABLE THEME CONTROLLER (FIXED)
// ============================================================

// ----------------------
// SIDEBAR
// ----------------------

const sidebar = document.getElementById("sidebar");
let hideTimeout;

document.addEventListener("mousemove", event => {
    if (event.clientX < 50) {
        sidebar?.classList.add("visible");
    }
});

sidebar?.addEventListener("mouseleave", () => {
    clearTimeout(hideTimeout);

    hideTimeout = setTimeout(() => {
        sidebar?.classList.remove("visible");
    }, 100);
});


// ----------------------
// DROPDOWN
// ----------------------

const themeToggleButton = document.getElementById("theme-toggle");
const themeDropdown = document.getElementById("theme-dropdown");

themeToggleButton?.addEventListener("click", () => {
    themeDropdown?.classList.toggle("show");
});

window.addEventListener("click", event => {
    if (!event.target.matches('#theme-toggle')) {
        themeDropdown?.classList.remove("show");
    }
});


// ----------------------
// THEME SYSTEM
// ----------------------

const themes = {
    realTheme: { script: "./js/realTheme.js" },
    world: {script: "./js/world.js" },
    twilight: { script: "./js/twilight.js" },
    onyx: { script: "./js/onyx.js" },
    dawn: { script: "./js/dawn.js" },
    matrix: { script: "./js/matrix.js" }
};

let currentThemeAnimation = null;
let currentScript = null;


// HARD STOP HELPER (IMPORTANT FIX)
function killTheme() {

    // stop animation loop if theme exposed it
    if (currentThemeAnimation?.stop) {
        try { currentThemeAnimation.stop(); } catch (e) {}
    }

    currentThemeAnimation = null;

    // clear canvas safely
    const canvas = document.getElementById('themeCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    const fg = document.getElementById('foregroundCanvas');
    if (fg) {
        const ctx = fg.getContext('2d');
        ctx?.clearRect(0, 0, fg.width, fg.height);
    }

    // remove script safely
    if (currentScript?.parentNode) {
        currentScript.parentNode.removeChild(currentScript);
    }

    currentScript = null;
}


// THEME SWITCH
async function setTheme(theme) {

    if (!themes[theme]) {
        console.warn("Unknown theme:", theme);
        return;
    }

    killTheme();

    const script = document.createElement('script');
    script.src = themes[theme].script;
    script.defer = true;

    script.onload = () => {
        currentThemeAnimation = window.currentThemeAnimation || null;
    };

    document.head.appendChild(script);
    currentScript = script;

    document.body.className = '';
    document.body.classList.add(`${theme}-theme`);
}


// ----------------------
// UI BINDINGS
// ----------------------

document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', e => {
        setTheme(e.target.dataset.theme);
    });
});


// ----------------------
// INIT
// ----------------------

window.onload = () => setTheme('twilight');


// ----------------------
// CANVAS RESIZE
// ----------------------

const canvas = document.getElementById('themeCanvas');

function resizeCanvas() {
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();


// ----------------------
// SCROLL EFFECT
// ----------------------

window.addEventListener('scroll', () => {
    const fg = document.getElementById('foregroundCanvas');
    if (!fg) return;

    fg.style.transform = `translateY(-${window.scrollY}px)`;
});


function bindWorldUI() {

    const time = document.getElementById("timeOfDay");
    const season = document.getElementById("seasonSelect");
    const cloud = document.getElementById("cloudSelect");
    const precip = document.getElementById("precipSelect");

    if (!time || !season || !cloud || !precip) return;

    time.addEventListener("input", (e) => {
        if (!window.WORLD_STATE) return;
        window.WORLD_STATE.timeOfDay = Number(e.target.value);
    });

    season.addEventListener("change", (e) => {
        if (!window.WORLD_STATE) return;
        window.WORLD_STATE.season = e.target.value;
    });

    cloud.addEventListener("change", (e) => {
        if (!window.WORLD_STATE) return;
        window.WORLD_STATE.cloud = e.target.value;
    });

    precip.addEventListener("change", (e) => {

        if (!window.WORLD_STATE) return;

        const value = e.target.value;

        // rule: snow only in winter
        if (value === "snow" && window.WORLD_STATE.season !== "winter") {
            e.target.value = "none";
            window.WORLD_STATE.precipitation = "none";
            return;
        }

        window.WORLD_STATE.precipitation = value;
    });
}

window.addEventListener("load", () => {
    bindWorldUI();
});