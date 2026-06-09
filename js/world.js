// ============================================================
// WORLD.JS — SINGLE RENDER ENGINE (BG + FG)
// Controlled by script.js
// ============================================================

(() => {

    // ========================================================
    // STATE (external controllable later)
    // ========================================================
    const world = {
        timeOfDay: 14,   // 0–23
        season: "summer", // spring | summer | autumn | winter
        cloud: "clear",   // clear | cloudy | overcast
        precip: "none"    // none | rain | snow
    };

    window.worldState = world;

    // ========================================================
    // CANVAS SETUP
    // ========================================================
    const canvas = document.getElementById("themeCanvas");
    const fgCanvas = document.getElementById("foregroundCanvas");

    if (!canvas || !fgCanvas) return;

    const ctx = canvas.getContext("2d");
    const fctx = fgCanvas.getContext("2d");

    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;

    let fw = fgCanvas.width = fgCanvas.offsetWidth;
    let fh = fgCanvas.height = fgCanvas.offsetHeight;

    window.addEventListener("resize", () => {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;

        fw = fgCanvas.width = fgCanvas.offsetWidth;
        fh = fgCanvas.height = fgCanvas.offsetHeight;

        buildScene();
        buildHills();
        buildScene();
    });

    // ========================================================
    // STARS (STATIC)
    // ========================================================
    const stars = [];
    function buildStars() {
        stars.length = 0;
        for (let i = 0; i < 140; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.2,
                a: 0.3 + Math.random() * 0.5
            });
        }
    }

    function starsVisible(hour) {
        return hour < 5 || hour >= 21;
    }

    // ========================================================
    // CLOUDS (LIGHT)
    // ========================================================
    const clouds = [];
    function buildClouds() {
        clouds.length = 0;
        for (let i = 0; i < 6; i++) {
            clouds.push({
                x: Math.random() * w,
                y: 50 + i * 35,
                s: 80 + Math.random() * 80
            });
        }
    }

    function cloudAlpha(mode) {
        if (mode === "clear") return 0;
        if (mode === "cloudy") return 0.25;
        return 0.45;
    }

    // MOUNTAINS
    const mountains = [];
    function buildMountains() {
        mountains.length = 0;

        for (let i = 0; i < 8; i++) {
            mountains.push({
                x: i * (w / 3) - 100,
                w: w / 2 + Math.random() * 200,
                h: 120 + Math.random() * 180,
                y: h * 0.55 + Math.random() * 40,
                speed: 0.02 + Math.random() * 0.03
            });
        }
    }

    // ========================================================
    // TREES (FG STATIC)
    // ========================================================
    const trees = [];
    function buildTrees() {
        trees.length = 0;
        for (let i = 0; i < 50; i++) {
            trees.push({
                x: Math.random() * fw,
                y: fh - 40 - Math.random() * 70,
                s: 0.7 + Math.random()
            });
        }
    }
    
    // ========================================================
    // LANDSCAPE — HORIZON HILLS (STATIC LAYERS)
    // ========================================================

    const hills = [];

    function buildHills() {
        hills.length = 0;
    
        const layers = [
            { layer: 0, y: fh * 0.45, amp: 40, step: fw / 6 },
            { layer: 1, y: fh * 0.60, amp: 70, step: fw / 5 },
            { layer: 2, y: fh * 0.78, amp: 110, step: fw / 4 }
        ];
    
        for (const l of layers) {
            for (let i = 0; i < 10; i++) {
                hills.push({
                    layer: l.layer,
                    x: i * l.step + (Math.random() * 80 - 40),
                    y: l.y + (Math.random() * 20 - 10),
                    amp: l.amp * (0.6 + Math.random() * 0.8),
                    w: l.step * 1.5
                });
            }
        }
    }

    // ========================================================
    // WORLD BUILD
    // ========================================================
    function buildScene() {
        buildStars();
        buildClouds();
        buildTrees();
        buildHills();
    }

    buildScene();

    // ========================================================
    // SKY
    // ========================================================
    function sky(hour) {
        if (hour < 6) return "#0b1020";
        if (hour < 8) return "#ffb36b";
        if (hour < 18) return "#87c9ff";
        if (hour < 21) return "#ff7a4f";
        return "#0b1020";
    }

    // ========================================================
    // FOREGROUND COLOR
    // ========================================================
    function fgTint(world) {
        const night = world.timeOfDay < 6 || world.timeOfDay > 20;

        if (night) return "rgba(0,10,25,0.35)";

        switch (world.season) {
            case "spring": return "rgba(60,140,60,0.25)";
            case "summer": return "rgba(40,120,40,0.25)";
            case "autumn": return "rgba(140,90,40,0.25)";
            case "winter": return "rgba(180,210,230,0.25)";
        }
    }

    // ========================================================
    // LOOP IDS
    // ========================================================
    let bgId;
    let fgId;

    // ========================================================
    // BACKGROUND LOOP
    // ========================================================
    function drawBG() {

        const t = world.timeOfDay;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = sky(t);
        ctx.fillRect(0, 0, w, h);

        // STARS
        if (starsVisible(t)) {
            ctx.fillStyle = "#fff";
            for (const s of stars) {
                ctx.globalAlpha = s.a;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        // CLOUDS
        const a = cloudAlpha(world.cloud);
        if (a > 0) {
            ctx.fillStyle = `rgba(255,255,255,${a})`;

            for (const c of clouds) {
                c.x += 0.05;
                if (c.x > w + 200) c.x = -200;

                ctx.beginPath();
                ctx.ellipse(c.x, c.y, c.s, 40, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        bgId = requestAnimationFrame(drawBG);
    }

    // ========================================================
    // FOREGROUND LOOP
    // ========================================================
    let frame = 0;

    function drawFG() {
        frame++;

        fctx.clearRect(0, 0, fw, fh);

        // GROUND
        let ground =
            world.season === "spring" ? "#4caf50" :
            world.season === "summer" ? "#2e7d32" :
            world.season === "autumn" ? "#c97b3b" :
            "#e6f2ff";

        // ========================================================
        // RENDER RIDGELINE TERRAIN (NOT FLAT SHAPES)
        // ========================================================
        
        const baseGround =
            world.season === "spring" ? "#3f8f4a" :
            world.season === "summer" ? "#2e6b34" :
            world.season === "autumn" ? "#8a5a2b" :
            "#cfd8dc";
        
        function hillColor(layer, shade) {
            const r = parseInt(baseGround.slice(1, 3), 16);
            const g = parseInt(baseGround.slice(3, 5), 16);
            const b = parseInt(baseGround.slice(5, 7), 16);
        
            const depth = layer === 0 ? 0.55 : layer === 1 ? 0.75 : 1.0;
        
            return `rgb(${r * depth * shade}, ${g * depth * shade}, ${b * depth * shade})`;
        }
        
        // group hills by layer
        const layers = [[], [], []];
        for (const h of hills) layers[h.layer].push(h);
        
        // draw far → near
        for (let l = 0; l < layers.length; l++) {
        
            const group = layers[l];
        
            fctx.beginPath();
            fctx.moveTo(0, fh);
        
            for (const h of group) {
                const peakY = h.y - h.amp;
        
                // THIS is the key: slope-based silhouette, not ellipse blobs
                fctx.lineTo(h.x, h.y);
                fctx.lineTo(h.x + h.w * 0.5, peakY);
                fctx.lineTo(h.x + h.w, h.y);
            }
        
            fctx.lineTo(fw, fh);
            fctx.closePath();
        
            fctx.fillStyle = hillColor(l, 1);
            fctx.fill();
        }

        // TREES
        const sway = Math.sin(frame * 0.01) * 2;

        for (const t of trees) {
            const groundY = fh * 0.78;
            fctx.fillStyle = "#0b0f14";
            fctx.beginPath();
            fctx.moveTo(t.x, t.y);
            fctx.lineTo(t.x - 10 * t.s + sway, t.y + 30 * t.s);
            fctx.lineTo(t.x + 10 * t.s + sway, t.y + 30 * t.s);
            fctx.closePath();
            fctx.fill();
        }

        // NIGHT TINT
        fctx.fillStyle = fgTint(world);
        fctx.fillRect(0, 0, fw, fh);

        fgId = requestAnimationFrame(drawFG);
    }

    // ========================================================
    // START
    // ========================================================
    drawBG();
    drawFG();

    // ========================================================
    // STOP HOOK (FOR script.js)
    // ========================================================
    window.currentThemeAnimation = {
        stop: () => {
            cancelAnimationFrame(bgId);
            cancelAnimationFrame(fgId);
        }
    };

})();