(() => {
    const canvas = document.getElementById('themeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const rays = [];
    for (let i = 0; i < 8; i++) {
        rays.push({
            x: Math.random() * width,
            y: height,
            w: 50 + Math.random() * 80,
            h: height,
            alpha: 0.1 + Math.random() * 0.1,
            speed: 0.2 + Math.random() * 0.3
        });
    }


    let animationId;

    function draw() {
        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#fceabb');
        grad.addColorStop(0.5, '#f8e5a3');
        grad.addColorStop(1, '#e6f3d1');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Godrays
        rays.forEach(r => {
            ctx.fillStyle = `rgba(255, 223, 130, ${r.alpha})`;
            ctx.fillRect(r.x, r.y - r.h, r.w, r.h);
            r.alpha += (Math.random() - 0.5) * 0.01;
        });

        animationId = requestAnimationFrame(draw);
    }

    draw();

    window.currentThemeAnimation = { stop: () => cancelAnimationFrame(animationId) };

    window.addEventListener('resize', () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    });
})();