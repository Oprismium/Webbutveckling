// Sidebar behavior
const sidebar = document.getElementById("sidebar");
let hideTimeout;

document.addEventListener("mousemove", event => {
    if (event.clientX < 50) sidebar.classList.add("visible");
});

sidebar.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(() => sidebar.classList.remove("visible"), 100);
});

// Dropdown
const themeToggleButton = document.getElementById("theme-toggle");
const themeDropdown = document.getElementById("theme-dropdown");

themeToggleButton.addEventListener("click", () => themeDropdown.classList.toggle("show"));
window.addEventListener("click", event => {
    if (!event.target.matches('#theme-toggle') && themeDropdown.classList.contains("show")) {
        themeDropdown.classList.remove("show");
    }
});

// Theme map
const themes = {
    realTheme: { script: "./realTheme.js" },
    twilight: { script: "./twilight.js" },
    onyx: { script: "./onyx.js" },
    dawn: { script: "./dawn.js" },
    matrix: { script: "./matrix.js" }
};

let currentThemeAnimation = null;
let currentScript = null;

async function setTheme(theme) {
    // Stop previous animation
    if (currentThemeAnimation?.stop) currentThemeAnimation.stop();

    // Clear canvas
    const canvas = document.getElementById('themeCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Remove previously loaded script
    if (currentScript) document.head.removeChild(currentScript);

    // Load new script
    const script = document.createElement('script');
    script.src = themes[theme].script;
    script.defer = true;
    document.head.appendChild(script);
    currentScript = script;

    // Update body class
    document.body.className = '';
    document.body.classList.add(`${theme}-theme`);
}

// Theme selection buttons
document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', e => setTheme(e.target.dataset.theme));
});

// Initial theme
window.onload = () => setTheme('realTheme');

// Resize canvas to header
const canvas = document.getElementById('themeCanvas');
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


window.addEventListener('scroll', () => {
    const fg = document.getElementById('foregroundCanvas');
    const scrollTop = window.scrollY;

    // Move FG canvas up with scroll
    fg.style.transform = `translateY(-${scrollTop}px)`;
});


