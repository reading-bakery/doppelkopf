document.addEventListener('DOMContentLoaded', () => {
    const gameModal = document.getElementById("game-modal");
    const closeX = document.getElementById("close-modal-x");
    const superBtn = document.getElementById("super-btn");
    const gamesList = document.getElementById('open-games-list');
    const soloList = document.getElementById("modal-solo-list");

    const closeModal = (modalElement) => {
        modalElement.classList.remove('open');
    };

    // Hilfsfunktion: Solo-Liste generieren
    const renderSoloOptions = (spielerArray) => {
        soloList.innerHTML = `
            <div style="grid-column: span 2;" class="radio-wrapper">
                <input type="radio" name="solo-player" id="solo-none" value="keins" class="player-radio-btn" checked>
                <label for="solo-none" class="player-label">Kein Solo</label>
            </div>`;
        
        spielerArray.forEach((s, i) => {
            soloList.innerHTML += `
                <div class="radio-wrapper">
                    <input type="radio" name="solo-player" id="solo-${i}" value="${s}" class="player-radio-btn">
                    <label for="solo-${i}" class="player-label">${s}</label>
                </div>`;
        });
    };

    // 2. Klick auf "Weiterspielen" (Öffnen)
    gamesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-continue')) {
            const card = e.target.closest('.game-card');
            window.activeGameForContinue = JSON.parse(card.dataset.gameInfo);

            // Liste für Solo-Auswahl füllen
            renderSoloOptions(window.activeGameForContinue.spielerArray);

            gameModal.classList.add('open');
            document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
            document.getElementById('modal-step-1').classList.add('active');
        }
    });

    // 3. Navigation innerhalb des Modals
    gameModal.addEventListener('click', (e) => {
        // ZURÜCK-Button
        if (e.target.classList.contains('back-btn')) {
            const currentStep = e.target.closest('.modal-step');
            const prevStepId = parseInt(currentStep.id.split('-')[2]) - 1;
            const prevStep = document.getElementById('modal-step-' + prevStepId);
            if (prevStep) {
                currentStep.classList.remove('active');
                prevStep.classList.add('active');
            }
        }

        // WEITER-Button
        if (e.target.classList.contains('next-step-btn')) {
            const currentStep = e.target.closest('.modal-step');
            
            // Schritt 1 Validierung
            if (currentStep.id === 'modal-step-1') {
                const punkte = document.getElementById('modal-points-input').value;
                if (!punkte) return alert("Punkte eingeben!");
                window.activeGameForContinue.neuePunkte = punkte;
            }

            // Schritt 2 Speicherung (Solo Auswahl)
            if (currentStep.id === 'modal-step-2') {
                const selectedSolo = document.querySelector('input[name="solo-player"]:checked');
                window.activeGameForContinue.soloPlayer = selectedSolo ? selectedSolo.value : "keins";
            }

            const nextStepId = parseInt(currentStep.id.split('-')[2]) + 1;
            const nextStep = document.getElementById('modal-step-' + nextStepId);
            if (nextStep) {
                currentStep.classList.remove('active');
                nextStep.classList.add('active');
            }
        }
    });

    closeX.addEventListener('click', () => closeModal(gameModal));
    superBtn.addEventListener('click', () => {
        closeModal(gameModal);
        location.reload(); 
    });

// ... (innerhalb von DOMContentLoaded)

// Hilfsfunktion: Team-Liste generieren
const renderTeamOptions = (spielerArray) => {
    const teamList = document.getElementById("modal-team-list");
    teamList.innerHTML = "";

    spielerArray.forEach((s, i) => {
        teamList.innerHTML += `
            <div class="radio-wrapper">
                <input type="checkbox" id="team-${i}" value="${s}" class="player-radio-btn team-player">
                <label for="team-${i}" class="player-label">${s}</label>
            </div>`;
    });

    // Event-Listener für das Limit hinzufügen
    teamList.querySelectorAll(".team-player").forEach(cb => {
        cb.addEventListener("change", () => {
            const checked = teamList.querySelectorAll(".team-player:checked");
            teamList.querySelectorAll(".team-player").forEach(input => {
                input.disabled = (checked.length >= 2 && !input.checked);
            });
        });
    });
};

// ... (In der Event-Delegation beim Öffnen)
gamesList.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-continue')) {
        const card = e.target.closest('.game-card');
        window.activeGameForContinue = JSON.parse(card.dataset.gameInfo);

        // Beide Listen rendern
        renderSoloOptions(window.activeGameForContinue.spielerArray);
        renderTeamOptions(window.activeGameForContinue.spielerArray); 

        gameModal.classList.add('open');
        document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
        document.getElementById('modal-step-1').classList.add('active');
    }
});

// ... (Im WEITER-Button Block innerhalb des Modals)
if (currentStep.id === 'modal-step-3') {
    const selectedTeam = Array.from(document.querySelectorAll('.team-player:checked'))
                              .map(cb => cb.value);
    
    // Validierung: Wenn z.B. genau 2 Spieler gewählt werden müssen
    if (selectedTeam.length === 0) return alert("Wähle bitte Spieler aus!");
    window.activeGameForContinue.teamRe = selectedTeam;
}

});