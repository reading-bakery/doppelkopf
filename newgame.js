document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('game-modal');
    const openBtn = document.getElementById('open-modal-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const form = document.getElementById('new-game-form');

    // Sicherheitscheck für die Steuerungselemente des Modals
    if (!modal || !openBtn || !closeBtn || !form) {
        console.error("Modal-Elemente im HTML nicht gefunden. Prüfe deine IDs für Modal, Buttons und Form!");
        return;
    }

    // Modal öffnen
    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    // Modal schließen über das X
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Modal schließen, wenn man außerhalb des Fensters klickt
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Formular absenden
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

        // Kontroll-Log in der F12-Konsole, um zu sehen was ausgelesen wird
        console.log("Ausgelesene Daten:", { gameDate, player1, player2, player3, player4, gameRound });

        // Umstellung auf URLSearchParams (das Format, das Google Forms zwingend erwartet)
        // Hier sind deine echten, geprüften IDs fest hinterlegt!
        const urlEncodedData = new URLSearchParams();
        urlEncodedData.append('entry.824360719', gameDate);      // Datum
        urlEncodedData.append('entry.1406870107', player1);    // Name Spieler 1
        urlEncodedData.append('entry.1764879843', player2);    // Name Spieler 2
        urlEncodedData.append('entry.132908103', player3);     // Name Spieler 3
        urlEncodedData.append('entry.36076733', player4);      // Name Spieler 4
        urlEncodedData.append('entry.955427977', gameRound);    // Runden insgesamt

        /* HINWEIS: Falls du das HTML-Formular später um die restlichen Felder erweiterst,
           kannst du diese Zeilen einfach aktivieren:
        urlEncodedData.append('entry.1224263999', htmlData.get('gameSolo'));      // Solo?
        urlEncodedData.append('entry.957057574', htmlData.get('pointsPlayer1'));  // Punkte Spieler 1
        urlEncodedData.append('entry.238014956', htmlData.get('pointsPlayer2'));  // Punkte Spieler 2
        urlEncodedData.append('entry.1952914660', htmlData.get('pointsPlayer3')); // Punkte Spieler 3
        urlEncodedData.append('entry.1248216577', htmlData.get('pointsPlayer4')); // Punkte Spieler 4
        urlEncodedData.append('entry.972361183', htmlData.get('currentRound'));   // Aktuelle Runde
        urlEncodedData.append('entry.1282541600', htmlData.get('gameStich'));     // Stich
        */

        // WICHTIG: Ersetze 'HIER_DEINE_LANG_1FAIpQLS_ID_EINSETZEN' mit deiner echten Forms-ID!
        const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfayGd2q3Xnxz1-YmMeiuXoNk6yYLZQ_gNO-7Sv_wT4oI4IMw/formResponse';

        console.log("Sende Daten an Google Forms-URL...");

        // Per Fetch im url-encoded Format an Google senden
        fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: urlEncodedData.toString()
        })
        .then(() => {
            console.log('Daten wurden erfolgreich im Hintergrund abgeschickt!');
            alert('Spiel erfolgreich gestartet und in Tabelle eingetragen!');
            form.reset(); // Setzt das Formular im Modal zurück
            modal.classList.remove('active'); // Schließt das Modal
        })
        .catch((error) => {
            console.error('Kritischer Netzwerkfehler beim Senden:', error);
            alert('Fehler beim Speichern. Bitte Internetverbindung prüfen.');
        });
    });
});