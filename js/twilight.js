// Twilight Theme — BG + FG
(() => {
    // ----------------------
    // BACKGROUND CANVAS
    // ----------------------
    const canvas = document.getElementById('themeCanvas');
    if (!canvas) return;
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Aurora layers
    const auroraLayers = [];
    const auroraColors = [
        'rgba(102,255,153,0.12)',
        'rgba(85,230,140,0.1)',
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

    // Mist layers (subtle)
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

    // Stars
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

    // Aurora trails
    const trails = [];
    for (let i = 0; i < 3; i++) {
        trails.push({
            y: 20 + i * 30,
            amplitude: 10 + Math.random() * 20,
            wavelength: 800 + Math.random() * 400,
            phase: Math.random() * Math.PI * 2,
            speed: 0.0005 + Math.random() * 0.001,
            color: `rgba(150,255,220,0.05)`
        });
    }

    const shootingStars = [];

    let animationId;

    function drawBG() {
        ctx.clearRect(0, 0, width, height);

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        const pulse = 0.02 * Math.sin(Date.now() * 0.0005);
        grad.addColorStop(0, `rgba(${37 + pulse*20},19,56,1)`);
        grad.addColorStop(0.5, `rgba(${18 + pulse*10},11,30,1)`);
        grad.addColorStop(1, '#07060a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Stars
        stars.forEach(s => {
            ctx.globalAlpha = s.opacity + Math.sin(Date.now() * s.flicker) * 0.02;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Aurora layers
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

            const gradient = ctx.createLinearGradient(0, 0, 0, layer.amplitude * 2 + 20);
            const subtleAlpha = 0.05 + Math.sin(Date.now() * layer.flickerOffset) * 0.01;
            gradient.addColorStop(0, layer.color.replace(/0\.\d+\)/, `${0.1 + subtleAlpha})`));
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

        // Mist
        mistLayers.forEach(mist => {
            ctx.fillStyle = `rgba(200,200,200,${mist.alpha})`;
            ctx.beginPath();
            ctx.ellipse((mist.phase % (width + 400)) - 200, mist.y, width / 2, mist.height, 0, 0, 2 * Math.PI);
            ctx.fill();
            mist.phase += mist.speed;
        });

        // Aurora trails
        trails.forEach(t => {
            ctx.beginPath();
            for (let x = 0; x <= width; x += 2) {
                const y = t.y + Math.sin((x / t.wavelength) * 2 * Math.PI + t.phase) * t.amplitude;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = t.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            t.phase += t.speed;
        });

        // Shooting stars
        if (Math.random() < 0.004) {
            shootingStars.push({
                x: Math.random() * width,
                y: Math.random() * height / 2,
                length: 50 + Math.random() * 100,
                speed: 2 + Math.random() * 2,
                angle: Math.PI / 4,
                alpha: 0.4 + Math.random() * 0.3
            });
        }
        shootingStars.forEach((s, idx) => {
            ctx.strokeStyle = `rgba(255,255,255,${s.alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x + Math.cos(s.angle) * s.length, s.y + Math.sin(s.angle) * s.length);
            ctx.stroke();

            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            s.alpha -= 0.003;
            if (s.y > height / 2 || s.x > width || s.alpha <= 0) shootingStars.splice(idx, 1);
        });

        animationId = requestAnimationFrame(drawBG);
    }

    drawBG();

    window.currentThemeAnimation = {
        stop: () => cancelAnimationFrame(animationId)
    };

    window.addEventListener('resize', () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });
})();

// ----------------------
// FOREGROUND CANVAS
// ----------------------
(() => {
    const fgCanvas = document.getElementById('foregroundCanvas');
    if (!fgCanvas) return;
    fgCanvas.style.display = 'block';
    const fctx = fgCanvas.getContext('2d');

    let fgWidth = fgCanvas.width = fgCanvas.offsetWidth;
    let fgHeight = fgCanvas.height = fgCanvas.offsetHeight;

    // Hills
    const hills = [
        { x: 0, y: fgHeight, w: fgWidth * 1.2, h: 90, color: 'rgba(15,5,35,0.8)' },
        { x: -50, y: fgHeight, w: fgWidth, h: 70, color: 'rgba(25,10,50,0.7)' },
        { x: 30, y: fgHeight, w: fgWidth * 1.1, h: 50, color: 'rgba(35,15,65,0.5)' }
    ];

    // Tree layers
    let treeLayers = [];

    function createTrees() {
        treeLayers = [];
        // back
        const backTrees = [];
        for (let i = 0; i < Math.floor(fgWidth / 8); i++) backTrees.push({ x: Math.random() * fgWidth, y: fgHeight - 50, scale: 0.6 + Math.random() * 0.3 });
        treeLayers.push(backTrees);
        // middle
        const midTrees = [];
        for (let i = 0; i < Math.floor(fgWidth / 16); i++) midTrees.push({ x: Math.random() * fgWidth, y: fgHeight - (Math.random() * 40 + 30), scale: 0.9 + Math.random() * 0.4 });
        treeLayers.push(midTrees);
        // front
        const frontTrees = [];
        for (let i = 0; i < Math.floor(fgWidth / 32); i++) frontTrees.push({ x: Math.random() * fgWidth, y: fgHeight - (Math.random() * 50 + 20), scale: 1.2 + Math.random() * 0.6 });
        treeLayers.push(frontTrees);
    }
    createTrees();

    // Fireflies
    const fireflies = [];
    for (let i = 0; i < Math.floor(fgWidth / 40); i++) {
        fireflies.push({
            x: Math.random() * fgWidth,
            y: fgHeight - (Math.random() * 120 + 20),
            r: 1 + Math.random() * 2,
            dx: (Math.random() - 0.5) * 0.2,
            dy: (Math.random() - 0.5) * 0.2,
            alpha: 0.3 + Math.random() * 0.5,
            flickerSpeed: 0.01 + Math.random() * 0.02
        });
    }

    let frame = 0;

    function drawFG() {
        frame++;
        fctx.clearRect(0, 0, fgWidth, fgHeight);

        // Draw hills
        hills.forEach(h => {
            fctx.fillStyle = h.color;
            fctx.beginPath();
            fctx.ellipse(h.x + h.w / 2, h.y, h.w, h.h, 0, 0, Math.PI, true);
            fctx.fill();
        });

        // Tree sway
        const swayAngle = Math.sin(frame * 0.01) * 2;
        treeLayers.forEach(layer => {
            layer.forEach(t => {
                fctx.fillStyle = `rgba(10,10,20,0.85)`;
                fctx.beginPath();
                const tiers = 3 + (t.scale > 1 ? 1 : 0);
                for (let j = 0; j < tiers; j++) {
                    const tierHeight = 10 * t.scale;
                    const tierWidth = 4 * t.scale * (tiers - j);
                    const offset = swayAngle * (j / tiers);
                    fctx.moveTo(t.x, t.y - j * tierHeight);
                    fctx.lineTo(t.x - tierWidth + offset, t.y + tierHeight - j * tierHeight);
                    fctx.lineTo(t.x + tierWidth + offset, t.y + tierHeight - j * tierHeight);
                    fctx.closePath();
                }
                fctx.fill();
            });
        });

        // Fireflies
        fireflies.forEach(f => {
            fctx.globalAlpha = f.alpha + Math.sin(Date.now() * f.flickerSpeed) * 0.3;
            fctx.fillStyle = 'rgba(255,255,180,1)';
            fctx.beginPath();
            fctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            fctx.fill();
            f.x += f.dx;
            f.y += f.dy;
            if (f.x < 0) f.x = fgWidth;
            if (f.x > fgWidth) f.x = 0;
            if (f.y < fgHeight - 150) f.y = fgHeight - 20;
            if (f.y > fgHeight - 20) f.y = fgHeight - 150;
        });
        fctx.globalAlpha = 1;

        requestAnimationFrame(drawFG);
    }

    drawFG();

    window.addEventListener('resize', () => {
        fgWidth = fgCanvas.width = fgCanvas.offsetWidth;
        fgHeight = fgCanvas.height = fgCanvas.offsetHeight;
        createTrees();
    });
})();