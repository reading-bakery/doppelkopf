document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll('section.rule-card');
    const scrollNav = document.createElement('div');
    scrollNav.className = 'scroll-nav';
    document.body.appendChild(scrollNav);

    // 1. Punkte generieren
    sections.forEach(section => {
        const dot = document.createElement('a');
        dot.className = 'nav-dot';
        dot.href = `#${section.id}`;
        const title = section.querySelector('h3')?.innerText || "Abschnitt";
        dot.setAttribute('data-title', title);

        dot.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(section.id);
            window.scrollTo({
                top: target.offsetTop - 100, // Platz für Header lassen
                behavior: 'smooth'
            });
        });
        scrollNav.appendChild(dot);
    });

    const dots = document.querySelectorAll('.nav-dot');

    // 2. Die präzise Update-Funktion
    function updateNav() {
        let currentSectionId = "";
        
        // A) Sonderfall: Ganz oben auf der Seite? (Ersten Punkt aktivieren)
        if (window.scrollY < 150) {
            currentSectionId = sections[0].id;
        } 
        // B) Sonderfall: Ganz unten auf der Seite? (Letzten Punkt aktivieren)
        else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            currentSectionId = sections[sections.length - 1].id;
        } 
        // C) Normalfall: Finde die Sektion, die dem oberen Rand am nächsten ist
        else {
            let closestDistance = Infinity;
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                // Wir messen den Abstand der Karten-Oberkante zum oberen Bildschirmdrittel (150px)
                const distance = Math.abs(rect.top - 150); 
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    currentSectionId = section.id;
                }
            });
        }

        // 3. UI Update (Dots und Cards)
        sections.forEach(s => s.classList.remove('active-section'));
        dots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.getAttribute('href') === `#${currentSectionId}`) {
                dot.classList.add('active');
                document.getElementById(currentSectionId)?.classList.add('active-section');
            }
        });

        // Sichtbarkeit der Leiste
        scrollNav.classList.toggle('visible', window.scrollY > 200);
    }

    window.addEventListener('scroll', updateNav);
    updateNav(); // Sofort beim Start prüfen
});