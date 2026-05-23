document.addEventListener('DOMContentLoaded', () => {
    const gamesListContainer = document.getElementById('open-games-list');
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQpR0kGrSSxQ_texguYbMzYwGyUBHgBPCeKjk_dL8bgVRp2IaF5X10V-kq-i_BTj0PJPDiiRsqZbby0/pub?gid=1523607497&single=true&output=csv';

    if (!gamesListContainer) return;

    // Hilfsfunktion zum sauberen Trennen von CSV-Zeilen (berücksichtigt eventuelle Anführungszeichen)
    function parseCSVRow(text) {
        let p = '', c = '', r = [];
        let q = false;
        for (let i = 0; i < text.length; i++) {
            c = text[i];
            if (c === '"') { q = !q; }
            else if (c === ',' && !q) { r.push(p.trim()); p = ''; }
            else { p += c; }
        }
        r.push(p.trim());
        return r;
    }

    // CSV herunterladen und verarbeiten
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Netzwerkfehler beim Laden der Tabelle.');
            return response.text();
        })
        .then(csvText => {
            // Zeilen aufteilen und leere Zeilen entfernen
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            if (lines.length <= 1) {
                gamesListContainer.innerHTML = '<div class="no-games">Keine Spiele in der Datenbank gefunden.</div>';
                return;
            }

            // Exakte Spalten-Indizes korrigiert laut deiner Tabellenstruktur:
            const idxDatum = 1;          // Spalte B
            const idxRundenGesamt = 2;   // Spalte C
            const idxAktuelleRunde = 3;  // Spalte D
            const idxSp1 = 4;            // Spalte E
            const idxSp2 = 5;            // Spalte F
            const idxSp3 = 6;            // Spalte G
            const idxSp4 = 7;            // Spalte H

            const gamesGrouped = {};

            // Alle Zeilen der Tabelle durchgehen (Überspringt die Header-Zeile bei i = 0)
            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVRow(lines[i]);
                
                // Sicherheitsprüfung auf die maximale benötigte Spalte angehoben (idxSp4 = 7)
                if (row.length <= idxSp4) continue;

                const datum = row[idxDatum];
                if (!datum || datum === "") continue;

                const rundenGesamt = parseInt(row[idxRundenGesamt]) || 0;
                const aktuelleRunde = parseInt(row[idxAktuelleRunde]) || 0;
                
                // Spielerliste kompakt zusammenbauen (leere Felder fliegen raus)
                const spieler = [row[idxSp1], row[idxSp2], row[idxSp3], row[idxSp4]].filter(Boolean).join(', ');

                // Gruppieren: Wir merken uns pro Spieldatum immer nur den neuesten/höchsten Spielstand
                if (!gamesGrouped[datum] || aktuelleRunde > gamesGrouped[datum].aktuelleRunde) {
                    gamesGrouped[datum] = {
                        datum: datum,
                        rundenGesamt: rundenGesamt,
                        aktuelleRunde: aktuelleRunde,
                        spieler: spieler
                    };
                }
            }

            // Filtern: Nur die Spiele behalten, bei denen die aktuelle Runde kleiner als die Gesamtzahl ist
            const openGames = Object.values(gamesGrouped).filter(game => {
                return game.aktuelleRunde < game.rundenGesamt;
            });

            // Lade-Anzeige löschen
            gamesListContainer.innerHTML = '';

            if (openGames.length === 0) {
                gamesListContainer.innerHTML = '<div class="no-games">Aktuell gibt es keine offenen Spiele.</div>';
                return;
            }

            // Kacheln dynamisch erzeugen
            openGames.forEach(game => {
                // Datum von YYYY-MM-DD auf das gewohnte DD.MM.YYYY Format umstellen
                let formatiertesDatum = game.datum;
                if (game.datum.includes('-')) {
                    const teile = game.datum.split('-');
                    formatiertesDatum = `${teile[2]}.${teile[1]}.${teile[0]}`;
                }

                // Prozentrechnung für den Fortschrittsbalken
                const prozent = game.rundenGesamt > 0 ? (game.aktuelleRunde / game.rundenGesamt) * 100 : 0;

                const card = document.createElement('div');
                card.className = 'game-card';
                card.innerHTML = `
                    <div class="game-card-header">
                        <span class="game-date">${formatiertesDatum}</span>
                        <span class="game-progress">Runde ${game.aktuelleRunde} / ${game.rundenGesamt}</span>
                    </div>
                    <div class="game-card-body">
                        <p class="game-players">
                            <i data-lucide="users" class="icon-inline"></i> ${game.spieler}
                        </p>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${prozent}%"></div>
                        </div>
                    </div>
                    <div class="game-card-footer">
                        <button class="btn-continue" onclick="alert('Spiel vom ${formatiertesDatum} wird aufgerufen...')">Weiter spielen</button>
                    </div>
                `;
                gamesListContainer.appendChild(card);
            });

            // WICHTIG: Lucide-Icons rendern, nachdem das HTML dynamisch injiziert wurde
            if (window.lucide) {
                lucide.createIcons();
            }
        })
        .catch(error => {
            console.error(error);
            gamesListContainer.innerHTML = '<div class="error-text">Fehler beim Laden der Spieldaten.</div>';
        });
});