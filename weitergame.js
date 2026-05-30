document.addEventListener('DOMContentLoaded', () => {
    const gamesListContainer = document.getElementById('open-games-list');
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQpR0kGrSSxQ_texguYbMzYwGyUBHgBPCeKjk_dL8bgVRp2IaF5X10V-kq-i_BTj0PJPDiiRsqZbby0/pub?gid=1523607497&single=true&output=csv';

    // Modal-Elemente selektieren
    const modal = document.getElementById("game-modal");
    const closeBtn = document.querySelector(".close-modal-btn");
    const step1 = document.getElementById("modal-step-1");
    const step2 = document.getElementById("modal-step-2");
    const playersListContainer = document.getElementById("modal-players-list");
    const selectedPlayerInfo = document.getElementById("selected-player-info");
    
    // Modal Navigations-Buttons
    const toStep2Btn = document.getElementById("to-step-2");
    const backToStep1Btn = document.getElementById("back-to-step-1");
    const saveGameBtn = document.getElementById("save-game-score");

    if (!gamesListContainer) return;

    // Hilfsfunktion zum sauberen Trennen von CSV-Zeilen
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

    // Modal öffnen und dynamisch mit den echten Spielern + Option "Keiner" befüllen
    function openModal(spielerArray) {
        // Startet mit der Option "Keiner", standardmäßig ausgewählt. style="..." sorgt für die volle Breite im Grid.
        playersListContainer.innerHTML = `
            <div style="grid-column: span 2;">
                <input type="radio" name="solist" id="p-none" value="Keiner (Normales Spiel)" class="player-radio-btn" checked>
                <label for="p-none" class="player-label">Keiner (Normales Spiel)</label>
            </div>
        `;
        
        // Die echten Spieler aus der Tabellenzeile anhängen
        spielerArray.forEach((spieler, index) => {
            playersListContainer.innerHTML += `
                <div>
                    <input type="radio" name="solist" id="p-${index}" value="${spieler}" class="player-radio-btn">
                    <label for="p-${index}" class="player-label">${spieler}</label>
                </div>
            `;
        });

        // Setzt das Modal auf Schritt 1 zurück und zeigt es an
        step1.classList.add("active");
        step2.classList.remove("active");
        modal.classList.add("open");
    }

    // Modal Schließen-Events
    if (closeBtn) {
        closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    }
    window.addEventListener("click", (e) => { 
        if (e.target === modal) modal.classList.remove("open"); 
    });

    // Weiter zu Schritt 2
    if (toStep2Btn) {
        toStep2Btn.addEventListener("click", () => {
            const ausgewaehlterSpieler = document.querySelector('input[name="solist"]:checked');
            if (!ausgewaehlterSpieler) return;
            
            selectedPlayerInfo.textContent = `Auswahl: ${ausgewaehlterSpieler.value}`;
            step1.classList.remove("active");
            step2.classList.add("active");
        });
    }

    // Zurück zu Schritt 1
    if (backToStep1Btn) {
        backToStep1Btn.addEventListener("click", () => {
            step2.classList.remove("active");
            step1.classList.add("active");
        });
    }

    // Daten abspeichern
    if (saveGameBtn) {
        saveGameBtn.addEventListener("click", () => {
            const spieler = document.querySelector('input[name="solist"]:checked').value;
            const punkte = document.getElementById("modal-points").value;
            const stiche = document.getElementById("modal-tricks").value;

            if (!punkte || !stiche) {
                alert("Bitte trage Punkte und Stiche ein!");
                return;
            }

            console.log(`Gespeichert für ${spieler}: ${punkte} Punkte, ${stiche} Stiche.`);
            
            // TODO: Hier deine Speicherlogik (z.B. API-Post an Google Sheets) einbauen
            
            modal.classList.remove("open");
            document.getElementById("modal-points").value = "";
            document.getElementById("modal-tricks").value = "";
        });
    }

    // CSV herunterladen und verarbeiten
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Netzwerkfehler beim Laden der Tabelle.');
            return response.text();
        })
        .then(csvText => {
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            if (lines.length <= 1) {
                gamesListContainer.innerHTML = '<div class="no-games">Keine Spiele in der Datenbank gefunden.</div>';
                return;
            }

            const idxDatum = 1;          // Spalte B
            const idxRundenGesamt = 2;   // Spalte C
            const idxAktuelleRunde = 3;  // Spalte D
            const idxSp1 = 4;            // Spalte E
            const idxSp2 = 5;            // Spalte F
            const idxSp3 = 6;            // Spalte G
            const idxSp4 = 7;            // Spalte H

            const gamesGrouped = {};

            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVRow(lines[i]);
                
                if (row.length <= idxSp4) continue;

                const datum = row[idxDatum];
                if (!datum || datum === "") continue;

                const rundenGesamt = parseInt(row[idxRundenGesamt]) || 0;
                const aktuelleRunde = parseInt(row[idxAktuelleRunde]) || 0;
                
                // Spieler als sauberes Array extrahieren
                const spielerListe = [row[idxSp1], row[idxSp2], row[idxSp3], row[idxSp4]].filter(Boolean);

                if (!gamesGrouped[datum] || aktuelleRunde > gamesGrouped[datum].aktuelleRunde) {
                    gamesGrouped[datum] = {
                        datum: datum,
                        rundenGesamt: rundenGesamt,
                        aktuelleRunde: aktuelleRunde,
                        spielerString: spielerListe.join(', '),
                        spielerArray: spielerListe
                    };
                }
            }

            const openGames = Object.values(gamesGrouped).filter(game => {
                return game.aktuelleRunde < game.rundenGesamt;
            });

            gamesListContainer.innerHTML = '';

            if (openGames.length === 0) {
                gamesListContainer.innerHTML = '<div class="no-games">Aktuell gibt es keine offenen Spiele.</div>';
                return;
            }

            openGames.forEach(game => {
                let formatiertesDatum = game.datum;
                if (game.datum.includes('-')) {
                    const teile = game.datum.split('-');
                    formatiertesDatum = `${teile[2]}.${teile[1]}.${teile[0]}`;
                }

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
                            <i data-lucide="users" class="icon-inline"></i> ${game.spielerString}
                        </p>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${prozent}%"></div>
                        </div>
                    </div>
                    <div class="game-card-footer">
                        <button class="btn-continue">Weiter spielen</button>
                    </div>
                `;

                // Event-Listener bindet die Spieler der angeklickten Karte direkt ans Modal
                const continueBtn = card.querySelector('.btn-continue');
                continueBtn.addEventListener('click', () => {
                    openModal(game.spielerArray);
                });

                gamesListContainer.appendChild(card);
            });

            if (window.lucide) {
                lucide.createIcons();
            }
        })
        .catch(error => {
            console.error(error);
            gamesListContainer.innerHTML = '<div class="error-text">Fehler beim Laden der Spieldaten.</div>';
        });
});