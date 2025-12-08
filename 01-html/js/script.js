// script.js

const menuIcon = document.getElementById("menu-icon");
const menu = document.querySelector(".menu");

let menuVisible = false;
let closeTimeoutId;

// Functionality to handle menu
menuIcon.addEventListener("mouseover", () => {
    menuVisible = true;
    menu.style.display = "block";
    menu.style.opacity = "1";
    menu.style.transition = "opacity 0.3s ease-in";
    menu.style.transform = "translateX(0)";
    menuIcon.classList.add("open");
});

menuIcon.addEventListener("mouseleave", () => {
    closeTimeoutId = setTimeout(() => {
        menu.style.opacity = "0";
        menu.style.transform = "translateX(-20px)";
        setTimeout(() => {
            menu.style.display = "none";
        }, 300);
        menuIcon.classList.remove("open");
    }, 450); // Delay
});

menu.addEventListener("mouseenter", () => {
    clearTimeout(closeTimeoutId); // Stop closing
});

menu.addEventListener("mouseleave", () => {
    closeTimeoutId = setTimeout(() => {
        menu.style.opacity = "0";
        menu.style.transform = "translateX(-20px)";
        setTimeout(() => {
            menu.style.display = "none";
        }, 300);
        menuIcon.classList.remove("open");
    }, 450);
});

// Idle Animation
const cards = document.querySelectorAll('.card');
let idleTime = 0;

function resetIdleTime() {
    idleTime = 0;
    cards.forEach(card => card.classList.remove('idle-card')); // Stop idle animation
}

setInterval(() => {
    idleTime++;
    if (idleTime >= 5) { // 5 seconds of inactivity
        cards.forEach(card => card.classList.add('idle-card')); // Start idle animation
    }
}, 1000);

document.addEventListener('mousemove', resetIdleTime);
document.addEventListener('keypress', resetIdleTime);