(() => {
    const canvas = document.getElementById('themeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;


    const stars = [];
    for (let i = 0; i < 120; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.5,
            dx: -0.5 + Math.random(),
            dy: 0.2 + Math.random()
        });
    }

    let shootingStars = [];
    let animationId;

    function draw() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Stars
        ctx.fillStyle = '#ffffff';
        stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
            s.x += s.dx;
            s.y += s.dy;
            if (s.x < 0) s.x = width;
            if (s.x > width) s.x = 0;
            if (s.y < 0) s.y = height;
            if (s.y > height) s.y = 0;
        });

        // Shooting stars
        if (Math.random() < 0.005) {
            shootingStars.push({
                x: Math.random() * width,
                y: 0,
                length: 20 + Math.random() * 30,
                speed: 3 + Math.random() * 2
            });
        }

        shootingStars.forEach((s, idx) => {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x + s.length, s.y + s.length);
            ctx.stroke();
            s.x += s.speed;
            s.y += s.speed;
            if (s.y > height) shootingStars.splice(idx, 1);
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