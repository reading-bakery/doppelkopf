document.addEventListener('DOMContentLoaded', () => {
    // 1. Elemente referenzieren
    const gameModal = document.getElementById("game-modal");
    const closeX = document.getElementById("close-modal-x");
    const superBtn = document.getElementById("super-btn");
    const confirmModal = document.getElementById("confirm-modal");
    const gamesList = document.getElementById('open-games-list');

    // Funktion zum Schließen aller Modals
    const closeModal = (modalElement) => {
        modalElement.classList.remove('open');
    };

    // 2. Event-Delegation für die Spielliste (Öffnen)
    gamesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-continue')) {
            const card = e.target.closest('.game-card');
            window.activeGameForContinue = JSON.parse(card.dataset.gameInfo);

            gameModal.classList.add('open');
            document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
            document.getElementById('modal-step-1').classList.add('active');
        }
    });

    // 3. Navigation innerhalb des Modals (Weiter, Zurück)
    gameModal.addEventListener('click', (e) => {
        // ZURÜCK-Button Logik
        if (e.target.classList.contains('back-btn')) {
            const currentStep = e.target.closest('.modal-step');
            const prevStepId = parseInt(currentStep.id.split('-')[2]) - 1;
            const prevStep = document.getElementById('modal-step-' + prevStepId);
            
            if (prevStep) {
                currentStep.classList.remove('active');
                prevStep.classList.add('active');
            }
        }

        // WEITER-Button Logik
        if (e.target.classList.contains('next-step-btn')) {
            const currentStep = e.target.closest('.modal-step');
            
            // Validierung für Schritt 1 (Punkte)
            if (currentStep.id === 'modal-step-1') {
                const punkte = document.getElementById('modal-points-input').value;
                if (!punkte) return alert("Punkte eingeben!");
                window.activeGameForContinue.neuePunkte = punkte;
            }

            const nextStepId = parseInt(currentStep.id.split('-')[2]) + 1;
            const nextStep = document.getElementById('modal-step-' + nextStepId);
            if (nextStep) {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
            }
        }
    });

    // 4. Close & Super Button (Abschluss)
    closeX.addEventListener('click', () => closeModal(gameModal));
    
    superBtn.addEventListener('click', () => {
        closeModal(gameModal);
        // Optional: Hier die Seite neu laden oder Karte aktualisieren
        location.reload(); 
    });
});