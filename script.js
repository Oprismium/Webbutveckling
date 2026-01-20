// Sidebar hover behavior ONLY

document.addEventListener("mousemove", event => {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    if (event.clientX < 50) sidebar.classList.add("visible");
});