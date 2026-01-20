async function loadSidebar() {
    const res = await fetch('/partials/sidebar.html');
    const html = await res.text();
    document.body.insertAdjacentHTML('afterbegin', html);

    initSidebar();
    initThemeControls();
}


document.addEventListener('DOMContentLoaded', loadSidebar);