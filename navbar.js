/**
 * navbar.js - Lädt die Navbar und aktiviert den Toggle-Button
 */

async function initNavbar() {
    const placeholder = document.getElementById('nav-placeholder');
    
    // Falls kein Platzhalter da ist, bricht das Skript ab (verhindert Fehler)
    if (!placeholder) return;

    try {
        // 1. Navbar HTML laden
        const response = await fetch('navbar.html');
        if (!response.ok) throw new Error('Navbar Datei konnte nicht geladen werden');
        
        const html = await response.text();
        placeholder.innerHTML = html;

        // 2. Mobile Menu Logik aktivieren
        setupToggleLogic();

        // 3. Lucide Icons (falls du sie nutzt)
        if (window.lucide) {
            window.lucide.createIcons();
        }

    } catch (error) {
        console.error("Fehler beim Initialisieren der Navbar:", error);
    }
}

function setupToggleLogic() {
    const toggleBtn = document.getElementById('toggle-button');
    const navLinks = document.getElementById('nav-links');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const navbar = document.querySelector('.navbar');

    // Prüfen, ob die Elemente wirklich existieren
    if (!toggleBtn || !navLinks) return;

    // Klick-Event
    toggleBtn.addEventListener('click', () => {
        // Klassen umschalten (für CSS)
        navLinks.classList.toggle('active');
        if (navbar) navbar.classList.toggle('expanded');

        // Icons tauschen
        if (navLinks.classList.contains('active')) {
            menuIcon.style.display = 'none';
            closeIcon.style.display = 'block';
        } else {
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        }
    });
}

// Startet den Ladevorgang, sobald das Browser-Fenster bereit ist
document.addEventListener("DOMContentLoaded", initNavbar);

// Optional: Sticky-Effekt beim Scrollen
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.toggle('navbar-fixed', window.scrollY > 0);
    }
});