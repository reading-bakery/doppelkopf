document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.rule-card');
    const scrollNav = document.createElement('div');
    scrollNav.className = 'scroll-nav';
    document.body.appendChild(scrollNav);

    // Nav-Punkte generieren
    sections.forEach((section, index) => {
        // Falls die ID versehentlich im rule-content statt in der section sitzt, 
        // ziehen wir sie hier automatisch hoch oder vergeben eine Standard-ID.
        let id = section.getAttribute('id');
        
        if (!id) {
            const innerId = section.querySelector('.rule-content')?.getAttribute('id');
            if (innerId) {
                id = innerId;
                section.setAttribute('id', id); // ID auf die section verschieben
            } else {
                id = `step-${index}`;
                section.setAttribute('id', id);
            }
        }

        const title = section.querySelector('h3')?.innerText || `Schritt ${index + 1}`;
        
        const navItem = document.createElement('a');
        navItem.href = `#${id}`;
        navItem.className = 'nav-dot';
        navItem.setAttribute('data-title', title);
        
        navItem.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(id);
            if (target) {
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: targetPosition - 100, // Platz für die Navbar lassen
                    behavior: 'smooth'
                });
            }
        });
        
        scrollNav.appendChild(navItem);
    });

    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        // 1. Sichtbarkeit der Leiste steuern
        if (scrollPosition > 100) {
            scrollNav.classList.add('visible');
        } else {
            scrollNav.classList.remove('visible');
        }

        // 2. Aktiven Punkt ermitteln
        let current = "";

        // Spezialfall: Ende der Seite erreicht (aktiviert den letzten Dot)
        if (windowHeight + scrollPosition >= fullHeight - 100) {
            current = sections[sections.length - 1].getAttribute('id');
        } else {
            // Normales Scrollen
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                // Wenn das Element ca. im oberen Drittel des Screens ist
                if (scrollPosition >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
        }

        // 3. Dots updaten
        document.querySelectorAll('.nav-dot').forEach(dot => {
            dot.classList.remove('active');
            const dotHref = dot.getAttribute('href').replace('#', '');
            if (dotHref === current) {
                dot.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    // Einmal beim Laden ausführen, falls man schon mitten in der Seite ist
    handleScroll(); 
});