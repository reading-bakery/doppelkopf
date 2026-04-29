// setup.js

function loadComponent(id, file) {
    const targetElement = document.getElementById(id);
    if (!targetElement) return Promise.resolve(); // Promise zurückgeben für Konsistenz

    return fetch(file)
        .then(response => {
            if (response.ok) return response.text();
            throw new Error('Fehler beim Laden von ' + file);
        })
        .then(data => {
            targetElement.innerHTML = data;
            if (window.lucide) {
                lucide.createIcons();
            }
        })
        .catch(error => console.error(error));
}

document.addEventListener("DOMContentLoaded", () => {
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname.endsWith('Doko/');

    if (!isIndexPage) {
        loadComponent('nav-placeholder', 'navbar.html');
    }

    loadComponent('footer-placeholder', 'footer.html');

    // WICHTIG: Erst laden, dann die Funktion aus up.js starten
    loadComponent('topbutton-placeholder', 'topbutton.html').then(() => {
        if (typeof initBackToTop === "function") {
            initBackToTop();
        }
    });

    if (window.lucide) {
        lucide.createIcons();
    }
});