// realTheme.js — Dynamic Twilight/Real-time environment
(() => {
    const canvas = document.getElementById('themeCanvas');
    if (!canvas) return;
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // === Real-time parameters ===
    const themeState = {
        timeOfDay: 'night', // 'day', 'dawn', 'dusk', 'night'
        season: 'spring', // 'spring', 'summer', 'autumn', 'winter'
        cloudCoverage: 0, // 0–1
        windSpeed: 0, // 0–1
        precipitation: 0 // 0–1, snow or rain
    };

    // === Aurora layers ===
    const auroraLayers = [];
    const baseAuroraColors = [
        'rgba(102,255,153,0.12)',
        'rgba(85,230,140,0.1)',
        'rgba(120,250,180,0.08)',
        'rgba(150,255,220,0.06)'
    ];

    for (const element of baseAuroraColors) {
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

    // === Stars ===
    const stars = [];
    const starCount = 450;
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height / 1,
            r: 0.5 + Math.random() * 0.5,
            opacity: 0.3 + Math.random() * 0.5,
            flicker: Math.random() * 0.005
        });
    }

    // === Foreground canvas: hills and trees ===
    const fgCanvas = document.getElementById('foregroundCanvas');
    if (!fgCanvas) return;
    fgCanvas.style.display = 'block';
    const fgCtx = fgCanvas.getContext('2d');
    let fgWidth = fgCanvas.width = fgCanvas.offsetWidth;
    let fgHeight = fgCanvas.height = fgCanvas.offsetHeight;

    const hills = [
        { x: 0, y: fgHeight, w: fgWidth * 1.2, h: 90 },
        { x: -50, y: fgHeight, w: fgWidth, h: 70 },
        { x: 30, y: fgHeight, w: fgWidth * 1.1, h: 50 }
    ];

    let treeLayers = [];

    function createTrees() {
        treeLayers = [];

        // Back layer — many small tall trees
        const backTrees = [];
        const backCount = Math.floor(fgWidth / 6);
        for (let i = 0; i < backCount; i++) {
            backTrees.push({ x: Math.random() * fgWidth, y: fgHeight - 50, scale: 0.5 + Math.random() * 0.3 });
        }
        treeLayers.push(backTrees);

        // Middle layer
        const midTrees = [];
        const midCount = Math.floor(fgWidth / 12);
        for (let i = 0; i < midCount; i++) {
            midTrees.push({ x: Math.random() * fgWidth, y: fgHeight - (Math.random() * 40 + 30), scale: 0.8 + Math.random() * 0.4 });
        }
        treeLayers.push(midTrees);

        // Front layer — more detailed
        const frontTrees = [];
        const frontCount = Math.floor(fgWidth / 24);
        for (let i = 0; i < frontCount; i++) {
            frontTrees.push({ x: Math.random() * fgWidth, y: fgHeight - (Math.random() * 50 + 20), scale: 1.2 + Math.random() * 0.6 });
        }
        treeLayers.push(frontTrees);
    }

    createTrees();

    // === Wind streaks ===
    const windStreaks = [];
    for (let i = 0; i < 100; i++) {
        windStreaks.push({
            x: Math.random() * fgWidth,
            y: Math.random() * fgHeight / 2,
            length: 50 + Math.random() * 100,
            speed: 0.5 + Math.random() * 1,
            opacity: 0.05 + Math.random() * 0.05
        });
    }

    // === Fireflies ===
    const fireflies = [];
    for (let i = 0; i < 25; i++) {
        fireflies.push({
            x: Math.random() * fgWidth,
            y: Math.random() * fgHeight,
            r: 1 + Math.random() * 2,
            speedX: -0.3 + Math.random() * 0.6,
            speedY: -0.2 + Math.random() * 0.4,
            alpha: 0.5 + Math.random() * 0.5
        });
    }

    let frame = 0;
    let animationId;

    function draw() {
        frame++;
        // === Background ===
        ctx.clearRect(0, 0, width, height);
        let bgTop, bgMid, bgBottom;
        switch (themeState.timeOfDay) {
            case 'day':
                bgTop = 'rgba(135,206,250,1)';
                bgMid = 'rgba(180,220,255,1)';
                bgBottom = '#e0f0ff';
                break;
            case 'dawn':
                bgTop = 'rgba(255,160,120,1)';
                bgMid = 'rgba(255,200,160,1)';
                bgBottom = 'rgba(255,220,180,1)';
                break;
            case 'dusk':
                bgTop = 'rgba(120,80,150,1)';
                bgMid = 'rgba(80,40,130,1)';
                bgBottom = '#1a0b30';
                break;
            default: // night
                bgTop = 'rgba(37,19,56,1)';
                bgMid = 'rgba(18,11,30,1)';
                bgBottom = '#07060a';
        }
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, bgTop);
        bgGradient.addColorStop(0.5, bgMid);
        bgGradient.addColorStop(1, bgBottom);
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // === Stars ===
        if (themeState.timeOfDay === 'night' || themeState.timeOfDay === 'dusk') {
            stars.forEach(s => {
                ctx.globalAlpha = s.opacity + Math.sin(Date.now() * s.flicker) * 0.02;
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }

        // === Aurora layers ===
        auroraLayers.forEach(layer => {
            ctx.beginPath();
            for (let x = 0; x <= width; x++) {
                const wave = Math.sin((x / layer.wavelength) * 2 * Math.PI + layer.phase);
                const y = layer.yOffset + wave * layer.amplitude;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.lineTo(width, 0);
            ctx.lineTo(0, 0);
            ctx.closePath();
            let alphaMod = 1 - themeState.cloudCoverage * 0.7;
            const gradient = ctx.createLinearGradient(0, 0, 0, layer.amplitude * 2 + 20);
            gradient.addColorStop(0, layer.color.replace(/0\.\d+\)/, `${0.1*alphaMod})`));
            gradient.addColorStop(0.5, 'rgba(0,0,0,0.05)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.shadowColor = layer.color;
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.shadowBlur = 0;
            layer.phase += layer.speed;
            layer.yOffset += layer.verticalDrift;
            if (layer.yOffset < 0) layer.yOffset = 0;
            if (layer.yOffset > 80) layer.yOffset = 80;
        });

        // === Foreground hills and trees ===
        fgCtx.clearRect(0, 0, fgWidth, fgHeight);

        // Hills color based on season
        hills.forEach(h => {
            fgCtx.fillStyle = (themeState.season === 'winter') ? 'rgba(240,240,250,0.9)' : 'rgba(15,5,35,0.8)';
            fgCtx.beginPath();
            fgCtx.ellipse(h.x + h.w / 2, h.y, h.w, h.h, 0, 0, Math.PI, true);
            fgCtx.fill();
        });

        // Trees sway by wind
        const swayAngle = Math.sin(frame * 0.01) * 10 * themeState.windSpeed;

        treeLayers.forEach(layer => {
            layer.forEach(t => {
                fgCtx.fillStyle = 'rgba(10,10,20,0.85)';
                fgCtx.beginPath();
                const tiers = 3 + (t.scale > 1 ? 1 : 0);
                for (let j = 0; j < tiers; j++) {
                    const tierHeight = 10 * t.scale;
                    const tierWidth = 3 * t.scale * (tiers - j);
                    const offset = swayAngle * (j / tiers);
                    fgCtx.moveTo(t.x, t.y - j * tierHeight);
                    fgCtx.lineTo(t.x - tierWidth + offset, t.y + tierHeight - j * tierHeight);
                    fgCtx.lineTo(t.x + tierWidth + offset, t.y + tierHeight - j * tierHeight);
                    fgCtx.closePath();
                }
                fgCtx.fill();
            });
        });

        // === Wind streaks ===
        windStreaks.forEach(ws => {
            ws.x -= ws.speed * themeState.windSpeed;
            if (ws.x < -ws.length) ws.x = fgWidth + Math.random() * 100;
            fgCtx.strokeStyle = `rgba(200,255,255,${ws.opacity})`;
            fgCtx.lineWidth = 1;
            fgCtx.beginPath();
            fgCtx.moveTo(ws.x, ws.y);
            fgCtx.lineTo(ws.x + ws.length, ws.y);
            fgCtx.stroke();
        });

        // === Fireflies (only night/dusk) ===
        if (themeState.timeOfDay === 'night' || themeState.timeOfDay === 'dusk') {
            fireflies.forEach(f => {
                f.x += f.speedX;
                f.y += f.speedY;
                if (f.x < 0) f.x = fgWidth;
                if (f.x > fgWidth) f.x = 0;
                if (f.y < 0) f.y = fgHeight;
                if (f.y > fgHeight) f.y = 0;
                fgCtx.globalAlpha = f.alpha * Math.sin(frame * 0.02);
                fgCtx.fillStyle = 'rgba(255,255,180,1)';
                fgCtx.beginPath();
                fgCtx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                fgCtx.fill();
            });
            fgCtx.globalAlpha = 1;
        }

        animationId = requestAnimationFrame(draw);
    }

    draw();

    // === API to update theme state ===
    globalThis.updateRealTheme = function({ timeOfDay, season, cloudCoverage, windSpeed, precipitation }) {
        if (timeOfDay) themeState.timeOfDay = timeOfDay;
        if (season) themeState.season = season;
        if (cloudCoverage !== undefined) themeState.cloudCoverage = Math.min(Math.max(cloudCoverage, 0), 1);
        if (windSpeed !== undefined) themeState.windSpeed = Math.min(Math.max(windSpeed, 0), 1);
        if (precipitation !== undefined) themeState.precipitation = Math.min(Math.max(precipitation, 0), 1);
    };

    globalThis.currentThemeAnimation = {
        stop: () => cancelAnimationFrame(animationId)
    };

    window.addEventListener('resize', () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
        fgWidth = fgCanvas.width = fgCanvas.offsetWidth;
        fgHeight = fgCanvas.height = fgCanvas.offsetHeight;
        createTrees();
    });

})();