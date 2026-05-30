document.addEventListener('DOMContentLoaded', () => {
    const gamesListContainer = document.getElementById('open-games-list');
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQpR0kGrSSxQ_texguYbMzYwGyUBHgBPCeKjk_dL8bgVRp2IaF5X10V-kq-i_BTj0PJPDiiRsqZbby0/pub?gid=1523607497&single=true&output=csv';

    // Modal Haupt-Elemente
    const modal = document.getElementById("game-modal");
    const closeX = document.getElementById("close-modal-x");
    const superBtn = document.getElementById("super-btn");
    const finalSaveBtn = document.getElementById("final-save-btn");

    let aktuellesSpielerArray = [];
    let aktuellerSchritt = 1;

    if (!gamesListContainer) return;

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

    // Modal initialisieren und alle Schritte vorbereiten
    function openModal(spielerArray) {
        aktuellesSpielerArray = spielerArray;
        aktuellerSchritt = 1;

        // 1. Solo-Liste befüllen (Schritt 1)
        const soloList = document.getElementById("modal-solo-list");
        soloList.innerHTML = `<div style="grid-column: span 2;"><input type="radio" name="solo-player" id="solo-none" value="Keins" class="player-radio-btn" checked><label for="solo-none" class="player-label">Kein Solo</label></div>`;
        spielerArray.forEach((s, i) => {
            soloList.innerHTML += `<div><input type="radio" name="solo-player" id="solo-${i}" value="${s}" class="player-radio-btn"><label for="solo-${i}" class="player-label">${s}</label></div>`;
        });

        // 2. Hochzeits-Liste befüllen (Schritt 2)
        const weddingList = document.getElementById("modal-wedding-list");
        weddingList.innerHTML = `<div style="grid-column: span 2;"><input type="radio" name="wedding-player" id="wed-none" value="Keine" class="player-radio-btn" checked><label for="wed-none" class="player-label">Keine Hochzeit</label></div>`;
        spielerArray.forEach((s, i) => {
            weddingList.innerHTML += `<div><input type="radio" name="wedding-player" id="wed-${i}" value="${s}" class="player-radio-btn"><label for="wed-${i}" class="player-label">${s}</label></div>`;
        });

        // 3. Namen in die Spieler-Schritte (Schritt 3 bis 6) eintragen
        const spielerSchritte = [3, 4, 5, 6];
        spielerSchritte.forEach((stepNum, index) => {
            const stepEl = document.getElementById(`modal-step-${stepNum}`);
            if (stepEl) {
                stepEl.querySelector(".step-player-name").textContent = spielerArray[index];
                // Inputs leeren
                stepEl.querySelector(".p-points").value = "";
                stepEl.querySelector(".p-tricks").value = "";
            }
        });

        showStep(1);
        modal.classList.add("open");
    }

    // Wechselt sichtbar zwischen den ID-Schritten
    function showStep(stepNum) {
        document.querySelectorAll(".modal-step").forEach(step => step.classList.remove("active"));
        const targetStep = document.getElementById(`modal-step-${stepNum}`);
        if (targetStep) targetStep.classList.add("active");
        aktuellerSchritt = stepNum;
    }

    // Universelle Event-Delegation für "Weiter"- und "Zurück"-Buttons im Modal
    modal.addEventListener("click", (e) => {
        if (e.target.classList.contains("next-step-btn") && !e.target.id.includes("super-btn")) {
            // Validierung für die Spieler-Eingaben (Schritte 3 bis 6)
            if (aktuellerSchritt >= 3 && aktuellerSchritt <= 6) {
                const currentStepEl = document.getElementById(`modal-step-${aktuellerSchritt}`);
                const pts = currentStepEl.querySelector(".p-points").value;
                const trk = currentStepEl.querySelector(".p-tricks").value;
                if (!pts || !trk) {
                    alert("Bitte Punkte und Stiche ausfüllen!");
                    return;
                }
            }
            
            // Wenn wir zu Schritt 7 (Zusammenfassung) gehen, bauen wir die Werte kurz zusammen
            if (aktuellerSchritt === 6) {
                buildSummary();
            }

            showStep(aktuellerSchritt + 1);
        }

        if (e.target.classList.contains("back-btn")) {
            showStep(aktuellerSchritt - 1);
        }
    });

    // Baut eine kleine Vorschau in Schritt 7 zusammen
    function buildSummary() {
        const summaryZone = document.getElementById("summary-cards-zone");
        const soloVal = document.querySelector('input[name="solo-player"]:checked').value;
        const wedVal = document.querySelector('input[name="wedding-player"]:checked').value;
        
        let html = `<p style="font-size:14px; color:#aaa;">Ansage: Solo: <b>${soloVal}</b> | Hochzeit: <b>${wedVal}</b></p><hr style="border-color:#333;">`;
        
        [3, 4, 5, 6].forEach((stepNum, i) => {
            const stepEl = document.getElementById(`modal-step-${stepNum}`);
            const pts = stepEl.querySelector(".p-points").value;
            const trk = stepEl.querySelector(".p-tricks").value;
            html += `<p style="font-size:15px; margin: 5px 0;"><b>${aktuellesSpielerArray[i]}:</b> ${pts} Punkte, ${trk} Stiche</p>`;
        });
        summaryZone.innerHTML = html;
    }

    // Schritt 7 -> Speichern Event
    finalSaveBtn.addEventListener("click", () => {
        // Hier sammelst du die Daten für deine DB / Google Sheets
        console.log("Daten werden an Google Sheets übermittelt...");
        
        // Weiter zu Schritt 8 (Erfolgsmeldung)
        showStep(8);
    });

    // Schritt 8 -> Super Button schließt das Modal endgültig
    superBtn.addEventListener("click", () => {
        modal.classList.remove("open");
    });

    // Modal Schließen bei 'X' oder Klick ins Dunkle
    closeX.addEventListener("click", () => modal.classList.remove("open"));
    window.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });

    // CSV Laden & Kacheln generieren
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Netzwerkfehler.');
            return response.text();
        })
        .then(csvText => {
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            if (lines.length <= 1) return;

            const idxDatum = 1, idxRundenGesamt = 2, idxAktuelleRunde = 3;
            const idxSp1 = 4, idxSp2 = 5, idxSp3 = 6, idxSp4 = 7;
            const gamesGrouped = {};

            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVRow(lines[i]);
                if (row.length <= idxSp4) continue;
                const datum = row[idxDatum];
                if (!datum) continue;

                const rundenGesamt = parseInt(row[idxRundenGesamt]) || 0;
                const aktuelleRunde = parseInt(row[idxAktuelleRunde]) || 0;
                const spielerListe = [row[idxSp1], row[idxSp2], row[idxSp3], row[idxSp4]].filter(Boolean);

                if (!gamesGrouped[datum] || aktuelleRunde > gamesGrouped[datum].aktuelleRunde) {
                    gamesGrouped[datum] = {
                        datum, rundenGesamt, aktuelleRunde,
                        spielerString: spielerListe.join(', '),
                        spielerArray: spielerListe
                    };
                }
            }

            const openGames = Object.values(gamesGrouped).filter(g => g.aktuelleRunde < g.rundenGesamt);
            gamesListContainer.innerHTML = '';

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
                        <p class="game-players"><i data-lucide="users" class="icon-inline"></i> ${game.spielerString}</p>
                        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${prozent}%"></div></div>
                    </div>
                    <div class="game-card-footer"><button class="btn-continue">Weiter spielen</button></div>
                `;

                card.querySelector('.btn-continue').addEventListener('click', () => openModal(game.spielerArray));
                gamesListContainer.appendChild(game.card || card);
            });

            if (window.lucide) lucide.createIcons();
        });
});