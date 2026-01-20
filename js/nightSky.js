// nightSky.js

(function() {

    const canvas = document.getElementById("nightSkyCanvas");
    const ctx = canvas.getContext("2d");

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = 200;

    const stars = [];
    const starCount = 100;
    const shootingStars = [];

    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1 + 0.5
        });
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);

        // stars
        stars.forEach(star => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // shooting stars
        shootingStars.forEach((s, i) => {
            ctx.fillStyle = 'white';
            ctx.fillRect(s.x, s.y, 2, 2);

            s.x += 5;
            s.y += 4;

            if (s.y > height || s.x > width) {
                shootingStars.splice(i, 1);
            }
        });

        if (Math.random() < 0.03) {
            shootingStars.push({
                x: Math.random() * width,
                y: 0
            });
        }
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = 200;
    }

    window.addEventListener("resize", resize);

    setInterval(draw, 50);

})();