// ============================================================
// WORLD.JS — CLEAN RENDER ENGINE (BG + FG)
// ============================================================

(() => {

    const world = {
        timeOfDay: 14,
        season: "summer",
        cloud: "clear",
        precip: "none"
    };

    window.worldState = world;

    const canvas = document.getElementById("themeCanvas");
    const fgCanvas = document.getElementById("foregroundCanvas");

    if (!canvas || !fgCanvas) return;

    const ctx = canvas.getContext("2d");
    const fctx = fgCanvas.getContext("2d");

    let w, h, fw, fh;

    function resize() {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;

        fw = fgCanvas.width = fgCanvas.offsetWidth;
        fh = fgCanvas.height = fgCanvas.offsetHeight;

        buildScene();
    }

    window.addEventListener("resize", resize);

    // ========================================================
    // NOISE
    // ========================================================
    function noise(x) {
        return (
            Math.sin(x * 0.006) * 0.7 +
            Math.sin(x * 0.013) * 0.2 +
            Math.sin(x * 0.021) * 0.1
        );
    }

    // ========================================================
    // SKY OBJECTS
    // ========================================================
    const stars = [];
    const clouds = [];

    function buildStars() {
        stars.length = 0;
        for (let i = 0; i < 140; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h * 0.6,
                r: Math.random() * 1.2,
                a: 0.2 + Math.random() * 0.6
            });
        }
    }

    function buildClouds() {
        clouds.length = 0;
        for (let i = 0; i < 7; i++) {
            clouds.push({
                x: Math.random() * w,
                y: 40 + i * 35,
                s: 80 + Math.random() * 100
            });
        }
    }

    function starsVisible(hour) {
        return hour < 5 || hour >= 21;
    }

    function cloudAlpha(mode) {
        return mode === "clear" ? 0 : mode === "cloudy" ? 0.25 : 0.45;
    }

    // ========================================================
    // FAR MOUNTAINS (BACKGROUND — MULTI-PEAK RANGE)
    // ========================================================

    function drawFarMountainsBackLayer() {
        const baseY = h * 0.78;

        ctx.beginPath();
        ctx.moveTo(0, h);

        for (let x = 0; x <= w + 40; x += 40) {

            const y =
                baseY
                - 80
                - noise(x * 0.905) * 86;

            ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();

        ctx.fillStyle = "#1f2a3d";
        ctx.fill();
    }
    
    function drawMountains() {

        // pushed DOWN = more sky dominance + proper distance feel
        const baseY = h * 0.78;

        ctx.beginPath();
        ctx.moveTo(0, h);

        // wider spacing = fewer peaks (KEY FIX)
        const step = 56;

        for (let x = 0; x <= w + step; x += step) {

            // large-scale mountain mass (slow variation)
            const mass =
                noise(x * 0.04 + world.timeOfDay * 1.2) * 55;

            // gentle ridge structure (NOT sharp spikes)
            const ridge =
                Math.sin(x * 0.08) * 7;

            // reduced cliff detail (subtle only)
            const cliff =
                Math.abs(noise(x * 0.15)) * 20;

            // very light breakup (prevents perfect smoothness)
            const micro =
                noise(x * 0.35) * 86;

            const y =
                baseY
                - 20
                - mass
                - ridge
                - cliff
                - micro;

            ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();

        ctx.fillStyle = "#141b22";
        ctx.fill();
    }

    // ========================================================
    // FOREGROUND HILLS (NO FULL OVERLAY, NO BOX EFFECT)
    // ========================================================
    const hills = [];

    function buildHills() {
        hills.length = 0;

        const layers = [
            { y: 0.70, h: 120, color: "#2f6a3d", density: 6 },
            { y: 0.78, h: 170, color: "#245533", density: 7 }
        ];

        for (const l of layers) {

            let x = -200; // start off-screen

            while (x < fw + 200) {

                const width =
                    180 +
                    Math.random() * 300 +
                    l.density * 20;

                const height =
                    l.h * (0.6 + Math.random() * 0.8);

                const gap =
                    40 + Math.random() * 160; // irregular spacing (KEY FIX)

                hills.push({
                    x: x + Math.random() * 60, // slight jitter
                    w: width,
                    h: height,
                    y: fh * l.y + (Math.random() * 25 - 12),
                    color: l.color
                });

                x += width * 0.6 + gap; // overlap + irregularity
            }
        }
    }

    // ========================================================
    // TREES
    // ========================================================
    const trees = [];

    function buildTrees() {
        trees.length = 0;
        for (let i = 0; i < 60; i++) {
            trees.push({
                x: Math.random() * fw,
                s: 0.7 + Math.random() * 1.2
            });
        }
    }

    // ========================================================
    // SCENE
    // ========================================================
    function buildScene() {
        buildStars();
        buildClouds();
        buildHills();
        buildTrees();
    }

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
    // LOOP
    // ========================================================
    let bgId, fgId;
    let frame = 0;

    function drawBG() {

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = sky(world.timeOfDay);
        ctx.fillRect(0, 0, w, h);

        drawFarMountainsBackLayer();
        drawMountains();

        if (starsVisible(world.timeOfDay)) {
            ctx.fillStyle = "#fff";
            for (const s of stars) {
                ctx.globalAlpha = s.a;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

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

    function drawFG() {

        frame++;
        fctx.clearRect(0, 0, fw, fh);

        // ====================================================
        // HILLS (IMPORTANT FIX: ground-clipped silhouette)
        // ====================================================
        for (const h of hills) {

            fctx.fillStyle = h.color;

            const peakOffset = h.h * (0.8 + Math.sin(h.x * 0.01) * 0.15);

            fctx.beginPath();
            fctx.moveTo(h.x, h.y);

            // asymmetrical hill shape (prevents identical blobs)
            fctx.quadraticCurveTo(
                h.x + h.w * 0.35,
                h.y - peakOffset * 0.6,
                h.x + h.w * 0.7,
                h.y - peakOffset * 0.2
            );

            fctx.quadraticCurveTo(
                h.x + h.w,
                h.y,
                h.x + h.w,
                fh
            );

            fctx.lineTo(h.x, fh);
            fctx.closePath();

            fctx.fill();
        }

        // ====================================================
        // TREES
        // ====================================================
        const sway = Math.sin(frame * 0.01) * 2;

        for (const t of trees) {
            const y = fh * 0.78 + noise(t.x) * 15;

            fctx.fillStyle = "#0b0f14";
            fctx.beginPath();
            fctx.moveTo(t.x, y);
            fctx.lineTo(t.x - 8 * t.s + sway, y + 25 * t.s);
            fctx.lineTo(t.x + 8 * t.s + sway, y + 25 * t.s);
            fctx.closePath();
            fctx.fill();
        }

        fgId = requestAnimationFrame(drawFG);
    }

    // ========================================================
    // START
    // ========================================================
    resize();
    drawBG();
    drawFG();

    window.currentThemeAnimation = {
        stop: () => {
            cancelAnimationFrame(bgId);
            cancelAnimationFrame(fgId);
        }
    };

})();