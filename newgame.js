document.addEventListener('DOMContentLoaded', () => {
    // Elemente für das Spiel-Formular-Modal
    const gameModal = document.getElementById('game-modal');
    const openGameBtn = document.getElementById('open-modal-btn');
    const closeGameBtn = document.getElementById('close-modal-btn');
    const form = document.getElementById('new-game-form');

    // Elemente für das NEUE Erfolgs-Modal
    const successModal = document.getElementById('success-modal');
    const closeSuccessBtn = document.getElementById('close-success-btn');
    const successDoneBtn = document.getElementById('success-done-btn');

    // Sicherheitscheck
    if (!gameModal || !openGameBtn || !closeGameBtn || !form || !successModal) {
        console.error("Fehler: Einige Modal-Elemente wurden im HTML nicht gefunden!");
        return;
    }

    // --- STEUERUNG: FORMULAR-MODAL ---
    openGameBtn.addEventListener('click', () => {
        gameModal.classList.add('active');
    });

    closeGameBtn.addEventListener('click', () => {
        gameModal.classList.remove('active');
    });

    // --- STEUERUNG: ERFOLGS-MODAL SCHLIESSEN ---
    const closeSuccess = () => {
        successModal.classList.remove('active');
    };
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeSuccess);
    if (successDoneBtn) successDoneBtn.addEventListener('click', closeSuccess);

    // Klicks außerhalb der Modals schließt das jeweilige Fenster
    window.addEventListener('click', (e) => {
        if (e.target === gameModal) {
            gameModal.classList.remove('active');
        }
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });

    // --- FORMULAR ABSENDEN ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("Formular-Submit erfolgreich ausgelöst!");

        // Daten über das HTML-'name'-Attribut auslesen
        const htmlData = new FormData(form);
        
        const gameDate = htmlData.get('gameDate');
        const player1 = htmlData.get('player1');
        const player2 = htmlData.get('player2');
        const player3 = htmlData.get('player3');
        const player4 = htmlData.get('player4');
        const gameRound = htmlData.get('gameRound');

        // Umstellung auf URLSearchParams für Google Forms
        const urlEncodedData = new URLSearchParams();
        urlEncodedData.append('entry.824360719', gameDate);      // Datum
        urlEncodedData.append('entry.1406870107', player1);    // Name Spieler 1
        urlEncodedData.append('entry.1764879843', player2);    // Name Spieler 2
        urlEncodedData.append('entry.132908103', player3);     // Name Spieler 3
        urlEncodedData.append('entry.36076733', player4);      // Name Spieler 4
        urlEncodedData.append('entry.955427977', gameRound);    // Runden insgesamt

        const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfayGd2q3Xnxz1-YmMeiuXoNk6yYLZQ_gNO-7Sv_wT4oI4IMw/formResponse';

        // Per Fetch an Google senden
        fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: urlEncodedData.toString()
        })
        .then(() => {
            console.log('Daten erfolgreich an Google übertragen!');
            
            // 1. Eingabe-Modal sofort schließen
            gameModal.classList.remove('active');
            
            // 2. Formular zurücksetzen für das nächste Mal
            form.reset();
            
            // 3. Das neue Erfolgs-Modal öffnen!
            successModal.classList.add('active');
        })
        .catch((error) => {
            console.error('Netzwerkfehler:', error);
            alert('Kritischer Fehler: Die Daten konnten nicht gespeichert werden.');
        });
    });
});