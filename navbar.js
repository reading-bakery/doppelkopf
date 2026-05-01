/**
 * navbar.js - Lädt Navbar & Lucide Icons
 */

async function initNavbar() {
    const placeholder = document.getElementById('nav-placeholder');
    if (!placeholder) return;

    try {
        const response = await fetch('navbar.html');
        if (!response.ok) throw new Error('Navbar Datei fehlt');
        
        const html = await response.text();
        placeholder.innerHTML = html;

        // 1. Lucide Icons rendern (WICHTIG!)
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // 2. Toggle Logik aktivieren
        setupToggleLogic();

    } catch (error) {
        console.error("Fehler:", error);
    }
}

function setupToggleLogic() {
    const toggleBtn = document.getElementById('toggle-button');
    const navLinks = document.getElementById('nav-links');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    if (!toggleBtn || !navLinks) return;

    // Standardzustand für die Icons setzen
    if (closeIcon) closeIcon.style.display = 'none';

    toggleBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Icons umschalten
        if (navLinks.classList.contains('active')) {
            menuIcon.style.display = 'none';
            closeIcon.style.display = 'block';
        } else {
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        }
    });
}

document.addEventListener("DOMContentLoaded", initNavbar);