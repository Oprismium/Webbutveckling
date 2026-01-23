async function loadSidebar() {
    const res = await fetch('/partials/sidebar.html');
    const html = await res.text();
    document.body.insertAdjacentHTML('afterbegin', html);

    initSidebar();
    initThemeControls();
}

<<<<<<< HEAD

=======
>>>>>>> 0dc8466bee2c78718d1438c08efbe9439b14d66a
document.addEventListener('DOMContentLoaded', loadSidebar);