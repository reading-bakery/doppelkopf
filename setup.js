// setup.js

function loadComponent(id, file) {
    const targetElement = document.getElementById(id);
    if (!targetElement) return; 

    return fetch(file) // 'return' hinzufügen, damit wir wissen, wann es fertig ist
        .then(response => {
            if (response.ok) return response.text();
            throw new Error('Fehler beim Laden von ' + file);
        })
        .then(data => {
            targetElement.innerHTML = data;
            // Hier drin werden Icons für NACHGELADENE Elemente (Navbar/Footer) aktiviert
            if (window.lucide) {
                lucide.createIcons();
            }
        })
        .catch(error => console.error(error));
}

// Wenn die Seite komplett geladen ist...
document.addEventListener("DOMContentLoaded", () => {
    
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('Doko/');

    if (!isIndexPage) {
        loadComponent('nav-placeholder', 'navbar.html');
    }

    loadComponent('footer-placeholder', 'footer.html');
    loadComponent('topbutton-placeholder', 'topbutton.html');

    // Das hier aktiviert Icons, die FEST im HTML der index.html stehen
    if (window.lucide) {
        lucide.createIcons();
    }
});