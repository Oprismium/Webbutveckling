// World Theme world.js — DATA DRIVEN WORLD ENGINE

(() => {

    // ============================================================
    // WORLD STATE (MASTER CONTROL)
    // ============================================================

    const WORLD_STATE = {
        timeOfDay: 6,          // 0 - 23
        season: "winter",       // winter | spring | summer | autumn
        cloud: "overcast",         // clear | cloudy | overcast
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
    // AURORA
    // ============================================================

    const auroraLayers = [];

    const auroraColors = [
        'rgba(102,255,153,0.12)',
        'rgba(85,230,140,0.10)',
        'rgba(120,250,180,0.08)',
        'rgba(150,255,220,0.06)'
    ];

    for (const element of auroraColors) {

        auroraLayers.push({
            amplitude: 40 + Math.random() * 60,
            wavelength: 600 + Math.random() * 800,
            yOffset: 10 + Math.random() * 50,
            phase: Math.random() * Math.PI * 2,
            speed: 0.001 + Math.random() * 0.002,
            color: element,
            verticalDrift: (Math.random() * 0.006) - 0.003,
            flickerOffset: Math.random() * 0.01
        });
    }

    // ============================================================
    // AURORA TRAILS
    // ============================================================

    const trails = [];

    for (let i = 0; i < 3; i++) {

        trails.push({
            y: 20 + i * 30,
            amplitude: 10 + Math.random() * 20,
            wavelength: 800 + Math.random() * 400,
            phase: Math.random() * Math.PI * 2,
            speed: 0.0005 + Math.random() * 0.001,
            color: 'rgba(150,255,220,0.05)'
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

        const daylight = (sun + 1) * 0.5;        // 0..1
        const nightlight = 1 - daylight;          // inverse

        ctx.clearRect(0, 0, width, height);

        // --------------------------------------------------------
        // SKY GRADIENT (TIME OF DAY CONTROL)
        // --------------------------------------------------------
        
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        
        const hour = WORLD_STATE.timeOfDay;
        
        // Helper
        function lerp(a, b, t) {
            return a + (b - a) * t;
        }
        
        function color(c1, c2, t) {
            return {
                r: lerp(c1.r, c2.r, t),
                g: lerp(c1.g, c2.g, t),
                b: lerp(c1.b, c2.b, t)
            };
        }
        
        // --------------------------------------------------------
        // SKY PRESETS
        // --------------------------------------------------------
        
        const NIGHT = {
            top: { r: 10, g: 10, b: 25 },
            mid: { r: 20, g: 15, b: 45 },
            bot: { r: 5, g: 5, b: 12 }
        };
        
        const SUNRISE = {
            top: { r: 90, g: 70, b: 140 },
            mid: { r: 220, g: 120, b: 90 },
            bot: { r: 255, g: 180, b: 100 }
        };
        
        const DAY = {
            top: { r: 70, g: 130, b: 255 },
            mid: { r: 140, g: 190, b: 255 },
            bot: { r: 210, g: 230, b: 255 }
        };
        
        const SUNSET = {
            top: { r: 120, g: 60, b: 100 },
            mid: { r: 255, g: 120, b: 70 },
            bot: { r: 255, g: 170, b: 90 }
        };
        
        // --------------------------------------------------------
        // PICK CURRENT PHASE
        // --------------------------------------------------------
        
        let skyTop;
        let skyMid;
        let skyBot;
        
        if (hour < 5) {
        
            skyTop = NIGHT.top;
            skyMid = NIGHT.mid;
            skyBot = NIGHT.bot;
        
        }
        else if (hour < 8) {
        
            const t = (hour - 5) / 3;
        
            skyTop = color(NIGHT.top, SUNRISE.top, t);
            skyMid = color(NIGHT.mid, SUNRISE.mid, t);
            skyBot = color(NIGHT.bot, SUNRISE.bot, t);
        
        }
        else if (hour < 10) {
        
            const t = (hour - 8) / 2;
        
            skyTop = color(SUNRISE.top, DAY.top, t);
            skyMid = color(SUNRISE.mid, DAY.mid, t);
            skyBot = color(SUNRISE.bot, DAY.bot, t);
        
        }
        else if (hour < 17) {
        
            skyTop = DAY.top;
            skyMid = DAY.mid;
            skyBot = DAY.bot;
        
        }
        else if (hour < 20) {
        
            const t = (hour - 17) / 3;
        
            skyTop = color(DAY.top, SUNSET.top, t);
            skyMid = color(DAY.mid, SUNSET.mid, t);
            skyBot = color(DAY.bot, SUNSET.bot, t);
        
        }
        else if (hour < 22) {
        
            const t = (hour - 20) / 2;
        
            skyTop = color(SUNSET.top, NIGHT.top, t);
            skyMid = color(SUNSET.mid, NIGHT.mid, t);
            skyBot = color(SUNSET.bot, NIGHT.bot, t);
        
        }
        else {
        
            skyTop = NIGHT.top;
            skyMid = NIGHT.mid;
            skyBot = NIGHT.bot;
        
        }
        
        // --------------------------------------------------------
        // DRAW GRADIENT
        // --------------------------------------------------------
        
        grad.addColorStop(
            0,
            `rgb(${skyTop.r},${skyTop.g},${skyTop.b})`
        );
        
        grad.addColorStop(
            0.5,
            `rgb(${skyMid.r},${skyMid.g},${skyMid.b})`
        );
        
        grad.addColorStop(
            1,
            `rgb(${skyBot.r},${skyBot.g},${skyBot.b})`
        );
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        

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
        // AURORA VISIBILITY (DAWN / DUSK / NIGHT ONLY)
        // --------------------------------------------------------

        const auroraVisibility =
            nightlight > 0.2 ? nightlight : 0; 
        // 1 at night → fades out toward day

        // Only draw if visible enough
        if (auroraVisibility > 0.01) {

            // --------------------------------------------------------
            // AURORA LAYERS
            // --------------------------------------------------------

            auroraLayers.forEach(layer => {

                ctx.beginPath();

                for (let x = 0; x <= width; x += 4) {

                    const wave =
                        Math.sin(
                            (x / layer.wavelength) * 2 * Math.PI +
                            layer.phase
                        );

                    const y =
                        layer.yOffset +
                        wave * layer.amplitude;

                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.lineTo(width, 0);
                ctx.lineTo(0, 0);
                ctx.closePath();

                const gradient =
                    ctx.createLinearGradient(
                        0,
                        0,
                        0,
                        layer.amplitude * 2 + 20
                    );

                const subtleAlpha =
                    (0.05 + Math.sin(now * layer.flickerOffset) * 0.01) *
                    auroraVisibility;

                gradient.addColorStop(
                    0,
                    layer.color.replace(
                        /0\.\d+\)/,
                        `${0.1 + subtleAlpha})`
                    )
                );

                gradient.addColorStop(
                    0.5,
                    `rgba(0,0,0,${0.05 * auroraVisibility})`
                );

                gradient.addColorStop(
                    1,
                    'rgba(0,0,0,0)'
                );

                ctx.fillStyle = gradient;
                ctx.fill();

                layer.phase += layer.speed;

                layer.yOffset += layer.verticalDrift;

                if (layer.yOffset < 0) layer.yOffset = 0;
                if (layer.yOffset > 80) layer.yOffset = 80;
            });

            // --------------------------------------------------------
            // MIST
            // --------------------------------------------------------

            mistLayers.forEach(mist => {

                ctx.fillStyle =
                    `rgba(200,200,200,${mist.alpha * auroraVisibility})`;

                ctx.beginPath();

                ctx.ellipse(
                    (mist.phase % (width + 400)) - 200,
                    mist.y,
                    width / 2,
                    mist.height,
                    0,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                mist.phase += mist.speed;
            });

            // --------------------------------------------------------
            // AURORA TRAILS
            // --------------------------------------------------------

            trails.forEach(trail => {

                ctx.beginPath();

                for (let x = 0; x <= width; x += 8) {

                    const y =
                        trail.y +
                        Math.sin(
                            (x / trail.wavelength) *
                            2 *
                            Math.PI +
                            trail.phase
                        ) *
                        trail.amplitude;

                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.strokeStyle =
                    trail.color.replace(
                        /0\.\d+\)/,
                        `${0.05 * auroraVisibility})`
                    );

                ctx.lineWidth = 2;
                ctx.stroke();

                trail.phase += trail.speed;
            });
        }

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
    // RESIZE BG
    // ============================================================

    window.addEventListener('resize', () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });

    (() => {

        const fgCanvas = document.getElementById('foregroundCanvas');
        if (!fgCanvas) return;
    
        const fctx = fgCanvas.getContext('2d');
    
        let w = fgCanvas.width = fgCanvas.offsetWidth;
        let h = fgCanvas.height = fgCanvas.offsetHeight;
    
        function getBrightness() {
            const t = WORLD_STATE.timeOfDay / 24;
            const sun = Math.sin((t - 0.25) * Math.PI * 2);
            return Math.max(0.25, Math.max(0, sun));
        }
    
        function getSeasonColors() {
            switch (WORLD_STATE.season) {
                case "winter":
                    return { grass: "180,180,200", hill: "140,140,160" };
                case "spring":
                    return { grass: "90,200,90", hill: "50,160,70" };
                case "summer":
                    return { grass: "40,140,60", hill: "20,90,40" };
                case "autumn":
                    return { grass: "200,120,40", hill: "120,70,20" };
            }
        }

        window.worldFG = {
            stop: () => {
                cancelAnimationFrame(fgAnimationId);
            }
        };

        // Tree layers
        let treeLayers = [];

        let trees = [];

        function createTrees() {

            trees = [];

            const treeCount = Math.floor(w / 8);

            for (let i = 0; i < treeCount; i++) {

                const x = Math.random() * w;

                const seed = Math.abs(
                    Math.sin(x * 0.0137)
                );

                trees.push({
                    x,
                    scale: 0.4 + seed * 1.4,
                    seed
                });
            }

            trees.sort((a, b) => a.scale - b.scale);
        }

        createTrees();

        function getBrightness() {

            const t = WORLD_STATE.timeOfDay / 24;

            const sun = Math.sin((t - 0.25) * Math.PI * 2);

            return Math.max(0.15, (sun + 1) * 0.5);
        }
        
        // ============================================================
        // TERRAIN FUNCTION (CORE LANDSCAPE SHAPE)
        // ============================================================
    
        function terrainHeight(x) {
    
            const base = h * 0.06;
    
            const wave1 = Math.sin(x * 0.002) * 40;
            const wave2 = Math.sin(x * 0.006) * 15;
            const wave3 = Math.sin(x * 0.0009) * 80;
    
            return base + wave1 + wave2 + wave3;
        }
    
        function drawFG() {

            const brightness = getBrightness();
            const season = getSeasonColors();
        
            fctx.clearRect(0, 0, w, h);

            // ============================================================
            // GROUND (SWEPT LANDSCAPE FILL)
            // ============================================================
        
            const groundGrad =
                fctx.createLinearGradient(
                    0,
                    h * 0.45,
                    0,
                    h
                );

            groundGrad.addColorStop(
                0,
                `rgba(${season.grass},${0.25 + brightness * 0.2})`
            );

            groundGrad.addColorStop(
                0,
                `rgba(${season.grass},${0.8 * brightness})`
            );
            
            groundGrad.addColorStop(
                0.5,
                `rgba(${season.grass},1)`
            );
            
            groundGrad.addColorStop(
                1,
                `rgba(15,15,20,1)`
            );
        
            fctx.fillStyle = groundGrad;
        
            fctx.beginPath();
            fctx.moveTo(0, h);
        
            for (let x = 0; x <= w; x += 4) {
                fctx.lineTo(x, terrainHeight(x));
            }
        
            fctx.lineTo(w, h);
            fctx.closePath();
            fctx.fill();
        
            // ============================================================
            // TREES
            // ============================================================
            
            const treeColor = `rgba(10,10,20,${0.55 + brightness * 0.45})`;
            const sway =
                Math.sin(performance.now() * 0.001) * 2;

            trees.forEach(tree => {

                const x = tree.x;

                const groundY =
                    terrainHeight(x);

                const treeHeight =
                    15 + tree.scale * 17;

                const treeWidth =
                    treeHeight * 0.45;

                const alpha =
                    0.4 + tree.scale * 0.4;

                fctx.fillStyle =
                    `rgba(10,10,20,${alpha * brightness})`;

                // trunk

                fctx.fillRect(
                    x - 1,
                    groundY,
                    2,
                    treeHeight * 0.3
                );

                // lower tier

                fctx.beginPath();

                fctx.moveTo(
                    x + sway,
                    groundY - treeHeight
                );

                fctx.lineTo(
                    x - treeWidth,
                    groundY
                );

                fctx.lineTo(
                    x + treeWidth,
                    groundY
                );

                fctx.closePath();
                fctx.fill();

                // upper tier

                fctx.beginPath();

                fctx.moveTo(
                    x + sway,
                    groundY - treeHeight * 1.4
                );

                fctx.lineTo(
                    x - treeWidth * 0.7,
                    groundY - treeHeight * 0.45
                );

                fctx.lineTo(
                    x + treeWidth * 0.7,
                    groundY - treeHeight * 0.45
                );

                fctx.closePath();
                fctx.fill();
            });
        
            // ============================================================
            // LOOP
            // ============================================================
        
            fgAnimationId = requestAnimationFrame(drawFG);
        }
    
        drawFG();
        
        // ============================================================
        // RESIZE FG
        // ============================================================
        function resizeFG() {

            const dpr = window.devicePixelRatio || 1;
        
            fgCanvas.style.width = "100%";
            fgCanvas.style.height = "150px";
        
            fgCanvas.width = fgCanvas.offsetWidth * dpr;
            fgCanvas.height = 150 * dpr;
        
            fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
            w = fgCanvas.offsetWidth;
            h = 150;
        }
        
        window.addEventListener('resize', resizeFG);
        resizeFG();
    
        // expose stop hook
        window.worldFG = {
            stop: () => {}
        };
    
    })();


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