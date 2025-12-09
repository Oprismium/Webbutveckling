(() => {
    const canvas = document.getElementById('themeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const lines = [];
    for (let i = 0; i < height / 4; i++) {
        lines.push({ y: i*4, offset: Math.random()*2 });
    }

    let animationId;

    function draw() {
        ctx.fillStyle = '#0c0c0c';
        ctx.fillRect(0,0,width,height);

        ctx.strokeStyle = 'rgba(0,255,0,0.05)';
        lines.forEach(l => {
            ctx.beginPath();
            ctx.moveTo(0, l.y + l.offset);
            ctx.lineTo(width, l.y + l.offset);
            ctx.stroke();
            l.offset += (Math.random()-0.5)*1;
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
