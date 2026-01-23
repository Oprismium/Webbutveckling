// Sidebar hover behavior ONLY
<<<<<<< HEAD

=======
>>>>>>> 0dc8466bee2c78718d1438c08efbe9439b14d66a
document.addEventListener("mousemove", event => {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    if (event.clientX < 50) sidebar.classList.add("visible");
});