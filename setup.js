// setup.js

function loadComponent(id, file) {
    const targetElement = document.getElementById(id);
    if (!targetElement) return Promise.resolve(); // Rückgabe eines leeren Versprechens

    return fetch(file)
        .then(response => {
            if (response.ok) return response.text();
            throw new Error('Fehler beim Laden von ' + file);
        })
        .then(data => {
            targetElement.innerHTML = data;

            // NEU: Wenn der Topbutton geladen wurde, aktiviere die Scroll-Logik
            if (id === 'topbutton-placeholder') {
                initScrollToTop();
            }

            if (window.lucide) {
                lucide.createIcons();
            }
        })
        .catch(error => console.error(error));
}

// Die Toggle-Logik für die Navbar (damit sie im mobilen Menü wächst)
function initNavbarToggle() {
    const toggleBtn = document.getElementById('toggle-button');
    const navLinks = document.getElementById('nav-links');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const navbar = document.querySelector('.navbar');

    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            if (navbar) navbar.classList.toggle('expanded');

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
}

document.addEventListener("DOMContentLoaded", () => {
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname.endsWith('Doko/');

    // Navbar nur laden, wenn nicht auf Index
    if (!isIndexPage) {
        loadComponent('nav-placeholder', 'navbar.html');
    }

    // Footer und Topbutton laden
    loadComponent('footer-placeholder', 'footer.html');
    loadComponent('topbutton-placeholder', 'topbutton.html');

    // Icons für fest im HTML stehende Elemente
    if (window.lucide) {
        lucide.createIcons();
    }
});

function initScrollToTop() {
    const topBtn = document.getElementById("backToTop");

    if (!topBtn) return;

    // Erscheinen/Verschwinden beim Scrollen
    window.onscroll = function() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            topBtn.style.display = "flex"; // "flex" statt "block", falls Icons drin sind
        } else {
            topBtn.style.display = "none";
        }
    };

    // Scroll-Aktion beim Klick
    topBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}