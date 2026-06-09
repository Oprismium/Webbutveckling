// World Theme world.js — DATA DRIVEN WORLD ENGINE

(() => {

    // ============================================================
    // WORLD STATE (MASTER CONTROL)
    // ============================================================

    const WORLD_STATE = {
        timeOfDay: 12,          // 0 - 23
        season: "spring",       // winter | spring | summer | autumn
        cloud: "clear",         // clear | cloudy | overcast
        precipitation: "none"   // none | rain | snow (winter only)
    };

    function syncUI() {

        const timeSlider = document.getElementById("timeOfDay");
        const seasonSelect = document.getElementById("seasonSelect");
        const cloudSelect = document.getElementById("cloudSelect");
        const precipSelect = document.getElementById("precipSelect");

        if (timeSlider) timeSlider.value = WORLD_STATE.timeOfDay;
        if (seasonSelect) seasonSelect.value = WORLD_STATE.season;
        if (cloudSelect) cloudSelect.value = WORLD_STATE.cloud;
        if (precipSelect) precipSelect.value = WORLD_STATE.precipitation;
    }

    syncUI();

    // Optional global access (for debugging / external control)
    window.WORLD_STATE = WORLD_STATE;

    // ============================================================
    // HELPERS
    // ============================================================

    function isDay() {
        return WORLD_STATE.timeOfDay >= 6 && WORLD_STATE.timeOfDay <= 18;
    }

    function starsEnabled() {
        return !isDay();
    }

    function getSeason() {
        return WORLD_STATE.season;
    }

    function getCloudAlpha() {
        switch (WORLD_STATE.cloud) {
            case "clear": return 0;
            case "cloudy": return 0.05;
            case "overcast": return 0.12;
            default: return 0;
        }
    }

    function getSeasonColors() {
        switch (WORLD_STATE.season) {
            case "winter":
                return { grass: "rgba(230,230,240,0.9)", hill: "rgba(180,180,200,0.9)" };
            case "spring":
                return { grass: "rgba(90,200,90,0.9)", hill: "rgba(50,160,70,0.9)" };
            case "summer":
                return { grass: "rgba(40,140,60,0.95)", hill: "rgba(20,90,40,0.95)" };
            case "autumn":
                return { grass: "rgba(200,120,40,0.95)", hill: "rgba(120,70,20,0.95)" };
            default:
                return { grass: "rgba(60,120,60,0.9)", hill: "rgba(40,80,40,0.9)" };
        }
    }

    function getTimeFactor() {
        // 0 = midnight, 12 = noon
        const t = WORLD_STATE.timeOfDay;

        // convert to 0–1 cycle
        return t / 24;
    }

    // ============================================================
    // BACKGROUND CANVAS
    // ============================================================

    const canvas = document.getElementById('themeCanvas');
    if (!canvas) return;

    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // ============================================================
    // STARS
    // ============================================================

    const stars = [];
    const starCount = 450;

    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: 0.5 + Math.random() * 0.5,
            opacity: 0.3 + Math.random() * 0.5,
            flicker: Math.random() * 0.005
        });
    }

    // ============================================================
    // AURORA / MIST
    // ============================================================

    const auroraLayers = [];
    const auroraColors = [
        'rgba(102,255,153,0.12)',
        'rgba(85,230,140,0.1)',
        'rgba(120,250,180,0.08)',
        'rgba(150,255,220,0.06)'
    ];

    for (const c of auroraColors) {
        auroraLayers.push({
            amplitude: 40 + Math.random() * 60,
            wavelength: 600 + Math.random() * 800,
            yOffset: 10 + Math.random() * 50,
            phase: Math.random() * Math.PI * 2,
            speed: 0.001 + Math.random() * 0.002,
            color: c,
            verticalDrift: (Math.random() * 0.006) - 0.003,
            flickerOffset: Math.random() * 0.01
        });
    }

    // ============================================================
    // MIST
    // ============================================================

    const mistLayers = [];
    for (let i = 0; i < 2; i++) {
        mistLayers.push({
            y: 50 + i * 20,
            height: 20 + Math.random() * 20,
            alpha: 0.01 + Math.random() * 0.015,
            speed: 0.05 + Math.random() * 0.05,
            phase: Math.random() * 200
        });
    }

    // ============================================================
    // SHOOTING STARS
    // ============================================================

    const shootingStars = [];

    let animationId;

    // ============================================================
    // DRAW LOOP
    // ============================================================

    function drawBG() {

        const now = performance.now();
        const day = isDay();
        const season = getSeasonColors();

        const time = getTimeFactor();
        // smooth sine wave:
        // -1 = night
        // +1 = day
        const sun = Math.sin((time - 0.25) * Math.PI * 2);

        const daylight = Math.max(0, sun);        // 0..1
        const nightlight = 1 - daylight;          // inverse

        ctx.clearRect(0, 0, width, height);

        // --------------------------------------------------------
        // SKY GRADIENT (TIME OF DAY CONTROL)
        // --------------------------------------------------------

        const grad = ctx.createLinearGradient(0, 0, 0, height);

        // NIGHT BASE
        const nightTop = { r: 10, g: 10, b: 25 };
        const nightMid = { r: 20, g: 10, b: 40 };
        const nightBot = { r: 5, g: 5, b: 10 };

        // DAY BASE
        const dayTop = { r: 80, g: 140, b: 255 };
        const dayMid = { r: 140, g: 200, b: 255 };
        const dayBot = { r: 200, g: 220, b: 255 };

        // interpolate helper
        const mix = (a, b) => a + (b - a) * daylight;

        const top = `rgba(${mix(nightTop.r, dayTop.r)},
                        ${mix(nightTop.g, dayTop.g)},
                        ${mix(nightTop.b, dayTop.b)},1)`;

        const mid = `rgba(${mix(nightMid.r, dayMid.r)},
                        ${mix(nightMid.g, dayMid.g)},
                        ${mix(nightMid.b, dayMid.b)},1)`;

        const bot = `rgba(${mix(nightBot.r, dayBot.r)},
                        ${mix(nightBot.g, dayBot.g)},
                        ${mix(nightBot.b, dayBot.b)},1)`;

        grad.addColorStop(0, top);
        grad.addColorStop(0.5, mid);
        grad.addColorStop(1, bot);

        // --------------------------------------------------------
        // CLOUD OVERLAY
        // --------------------------------------------------------

        const cloudAlpha = getCloudAlpha();
        if (cloudAlpha > 0) {
            ctx.fillStyle = `rgba(255,255,255,${cloudAlpha})`;
            ctx.fillRect(0, 0, width, height);
        }

        // --------------------------------------------------------
        // STARS (ONLY NIGHT)
        // --------------------------------------------------------

        const starVisibility = nightlight; // 1 at night, 0 at day
        if (starVisibility > 0.01) {
            stars.forEach(s => {
                ctx.globalAlpha = (s.opacity + Math.sin(now * s.flicker) * 0.02) * starVisibility;
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        ctx.globalAlpha = 1;

        // --------------------------------------------------------
        // AURORA (UNCHANGED LOGIC)
        // --------------------------------------------------------

        auroraLayers.forEach(layer => {

            ctx.beginPath();

            for (let x = 0; x <= width; x += 4) {
                const wave = Math.sin((x / layer.wavelength) * 2 * Math.PI + layer.phase);
                const y = layer.yOffset + wave * layer.amplitude;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.lineTo(width, 0);
            ctx.lineTo(0, 0);
            ctx.closePath();

            const g = ctx.createLinearGradient(0, 0, 0, 200);

            const alpha = 0.1 + Math.sin(now * layer.flickerOffset) * 0.01;

            g.addColorStop(0, layer.color.replace(/0\.\d+\)/, `${alpha})`));
            g.addColorStop(1, "rgba(0,0,0,0)");

            ctx.fillStyle = g;
            ctx.fill();

            layer.phase += layer.speed;
        });

        // --------------------------------------------------------
        // MIST
        // --------------------------------------------------------

        mistLayers.forEach(mist => {
            ctx.fillStyle = `rgba(200,200,200,${mist.alpha})`;
            ctx.beginPath();
            ctx.ellipse((mist.phase % (width + 400)) - 200,
                mist.y,
                width / 2,
                mist.height,
                0, 0, Math.PI * 2);
            ctx.fill();

            mist.phase += mist.speed;
        });

        // --------------------------------------------------------
        // PRECIPITATION
        // --------------------------------------------------------

        if (WORLD_STATE.precipitation === "rain") {

            ctx.strokeStyle = "rgba(180,200,255,0.3)";
            ctx.lineWidth = 1;

            for (let i = 0; i < 120; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - 2, y + 10);
                ctx.stroke();
            }
        }

        if (WORLD_STATE.precipitation === "snow" && WORLD_STATE.season === "winter") {

            ctx.fillStyle = "rgba(255,255,255,0.8)";

            for (let i = 0; i < 80; i++) {
                ctx.beginPath();
                ctx.arc(
                    Math.random() * width,
                    Math.random() * height,
                    Math.random() * 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }

        // --------------------------------------------------------
        // SHOOTING STARS
        // --------------------------------------------------------

        if (Math.random() < 0.004 && starsEnabled()) {
            shootingStars.push({
                x: Math.random() * width,
                y: Math.random() * height / 2,
                length: 50 + Math.random() * 100,
                speed: 2 + Math.random() * 2,
                angle: Math.PI / 4,
                alpha: 0.4 + Math.random() * 0.3
            });
        }

        shootingStars.forEach((s, i) => {

            ctx.strokeStyle = `rgba(255,255,255,${s.alpha})`;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(
                s.x + Math.cos(s.angle) * s.length,
                s.y + Math.sin(s.angle) * s.length
            );
            ctx.stroke();

            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            s.alpha -= 0.003;

            if (s.alpha <= 0) shootingStars.splice(i, 1);
        });

        animationId = requestAnimationFrame(drawBG);
    }

    drawBG();

    // ============================================================
    // STOP HANDLE (FIXED)
    // ============================================================

    window.currentThemeAnimation = {
        stop: () => {
            cancelAnimationFrame(animationId);
        }
    };

    // ============================================================
    // RESIZE
    // ============================================================

    window.addEventListener('resize', () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });


    function bindWorldControls() {

        console.log("BIND TRY:", {
            time: document.getElementById("timeOfDay"),
            season: document.getElementById("seasonSelect"),
            cloud: document.getElementById("cloudSelect"),
            precip: document.getElementById("precipSelect")
        });

        const timeSlider = document.getElementById("timeOfDay");
        const seasonSelect = document.getElementById("seasonSelect");
        const cloudSelect = document.getElementById("cloudSelect");
        const precipSelect = document.getElementById("precipSelect");

        if (!timeSlider || !seasonSelect || !cloudSelect || !precipSelect) {
            return;
        }

        // Time of day
        timeSlider.addEventListener("input", (e) => {
            WORLD_STATE.timeOfDay = parseInt(e.target.value, 10);
        });

        // Season
        seasonSelect.addEventListener("change", (e) => {
            WORLD_STATE.season = e.target.value;
        });

        // Cloud
        cloudSelect.addEventListener("change", (e) => {
            WORLD_STATE.cloud = e.target.value;
        });

        // Precipitation
        precipSelect.addEventListener("change", (e) => {
            const value = e.target.value;

            // enforce rule: snow only in winter
            if (value === "snow" && WORLD_STATE.season !== "winter") {
                precipSelect.value = "none";
                WORLD_STATE.precipitation = "none";
                return;
            }

            WORLD_STATE.precipitation = value;
        });
    }

    bindWorldControls();    
})();