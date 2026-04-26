document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.rule-card');
    const scrollNav = document.createElement('div');
    scrollNav.className = 'scroll-nav';
    document.body.appendChild(scrollNav);

    // Nav-Punkte generieren
    sections.forEach(section => {
        const id = section.getAttribute('id');
        const title = section.querySelector('h3').innerText;
        
        const navItem = document.createElement('a');
        navItem.href = `#${id}`;
        navItem.className = 'nav-dot';
        navItem.setAttribute('data-title', title);
        
        navItem.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(id);
            window.scrollTo({
                top: target.offsetTop - 100, // Offset für die Navbar
                behavior: 'smooth'
            });
        });
        
        scrollNav.appendChild(navItem);
    });

    const handleScroll = () => {
        const scrollPosition = window.scrollY;

        // Sichtbarkeit der Leiste steuern (erscheint nach 100px Scroll)
        if (scrollPosition > 100) {
            scrollNav.classList.add('visible');
        } else {
            scrollNav.classList.remove('visible');
        }

        // Aktiven Punkt markieren
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollPosition >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-dot').forEach(dot => {
            dot.classList.remove('active');
            if (dot.getAttribute('href').includes(current)) {
                dot.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
});