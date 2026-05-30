document.addEventListener('DOMContentLoaded', () => {
    const gamesListContainer = document.getElementById('open-games-list');
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQpR0kGrSSxQ_texguYbMzYwGyUBHgBPCeKjk_dL8bgVRp2IaF5X10V-kq-i_BTj0PJPDiiRsqZbby0/pub?gid=1523607497&single=true&output=csv';
    
    // ==========================================
    // DEINE GOOGLE FORMULAR CONFIG (100% KORREKT)
    // ==========================================
    const formId = '1FAIpQLSfayGd2q3Xnxz1-YmMeiuXoNk6yYLZQ_gNO-7Sv_wT4oI4IMw'; 

    const entryIds = {
        spiel_datum: 'entry.824360719',   
        runden_gesamt: 'entry.955427977', 
        aktuelle_runde: 'entry.1282541600',
        
        solo: 'entry.1248216577',          
        hochzeit: 'entry.1745650205',      
        
        s1_name: 'entry.1406870107',      
        s1_punkte: 'entry.972361183',     
        s1_stiche: 'entry.238014956',     
        
        s2_name: 'entry.1764879843',       
        s2_punkte: 'entry.1952914660',    
        s2_stiche: 'entry.505390666',     
        
        s3_name: 'entry.132908103',      
        s3_punkte: 'entry.1224263999',      
        s3_stiche: 'entry.693981030',     
        
        s4_name: 'entry.36076733',       
        s4_punkte: 'entry.957057574',      
        s4_stiche: 'entry.1960997850'      
    };
    // ==========================================

    // Modal Haupt-Elemente
    const modal = document.getElementById("game-modal");
    const closeX = document.getElementById("close-modal-x");
    const superBtn = document.getElementById("super-btn");
    const finalSaveBtn = document.getElementById("final-save-btn");

    // Globale Variablen für das aktuell geöffnete Spiel
    let aktuellesSpielerArray = [];
    let aktuelleGesamtRunden = 0;   
    let aktuelleRundenNummer = 0;   
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

    function openModal(spielerArray, rundenGesamt, aktuelleRunde) {
        aktuellesSpielerArray = spielerArray;
        aktuelleGesamtRunden = rundenGesamt; 
        aktuelleRundenNummer = aktuelleRunde; 
        aktuellerSchritt = 1;

        // Solo-Liste mit Standardwert "keins"
        const soloList = document.getElementById("modal-solo-list");
        soloList.innerHTML = `<div style="grid-column: span 2;"><input type="radio" name="solo-player" id="solo-none" value="keins" class="player-radio-btn" checked><label for="solo-none" class="player-label">Kein Solo</label></div>`;
        spielerArray.forEach((s, i) => {
            soloList.innerHTML += `<div><input type="radio" name="solo-player" id="solo-${i}" value="${s}" class="player-radio-btn"><label for="solo-${i}" class="player-label">${s}</label></div>`;
        });

        // Hochzeits-Liste mit Standardwert "keins"
        const weddingList = document.getElementById("modal-wedding-list");
        weddingList.innerHTML = `<div style="grid-column: span 2;"><input type="radio" name="wedding-player" id="wed-none" value="keins" class="player-radio-btn" checked><label for="wed-none" class="player-label">Keine Hochzeit</label></div>`;
        spielerArray.forEach((s, i) => {
            weddingList.innerHTML += `<div><input type="radio" name="wedding-player" id="wed-${i}" value="${s}" class="player-radio-btn"><label for="wed-${i}" class="player-label">${s}</label></div>`;
        });

        const spielerSchritte = [3, 4, 5, 6];
        spielerSchritte.forEach((stepNum, index) => {
            const stepEl = document.getElementById(`modal-step-${stepNum}`);
            if (stepEl) {
                stepEl.querySelector(".step-player-name").textContent = spielerArray[index];
                stepEl.querySelector(".p-points").value = "";
                stepEl.querySelector(".p-tricks").value = "";
            }
        });

        showStep(1);
        modal.classList.add("open");
    }

    function showStep(stepNum) {
        document.querySelectorAll(".modal-step").forEach(step => step.classList.remove("active"));
        const targetStep = document.getElementById(`modal-step-${stepNum}`);
        if (targetStep) targetStep.classList.add("active");
        aktuellerSchritt = stepNum;
    }

    modal.addEventListener("click", (e) => {
        if (e.target.classList.contains("next-step-btn") && !e.target.id.includes("super-btn")) {
            if (aktuellerSchritt >= 3 && aktuellerSchritt <= 6) {
                const currentStepEl = document.getElementById(`modal-step-${aktuellerSchritt}`);
                const pts = currentStepEl.querySelector(".p-points").value;
                const trk = currentStepEl.querySelector(".p-tricks").value;
                if (!pts || !trk) {
                    alert("Bitte Punkte und Stiche ausfüllen!");
                    return;
                }
            }
            
            if (aktuellerSchritt === 6) {
                buildSummary();
            }

            showStep(aktuellerSchritt + 1);
        }

        if (e.target.classList.contains("back-btn")) {
            showStep(aktuellerSchritt - 1);
        }
    });

    function buildSummary() {
        const summaryZone = document.getElementById("summary-cards-zone");
        const soloVal = document.querySelector('input[name="solo-player"]:checked').value;
        const wedVal = document.querySelector('input[name="wedding-player"]:checked').value;
        
        let html = `<p style="font-size:14px; color:#aaa;">Ansage: Solo: <b>${soloVal}</b> | Hochzeit: <b>${wedVal}</b></p><hr style="border-color:#333;">`;
        
        [3, 4, 5, 6].forEach((stepNum, i) => {
            const stepEl = document.getElementById(`modal-step-${stepNum}`);
            const pts = stepEl.querySelector(".p-points").value;
            const trk = stepEl.querySelector(".p-tricks").value;
            html += `<p style="font-size:15px; margin: 5px 0; color: whitesmoke;"><b>${aktuellesSpielerArray[i]}:</b> ${pts} Punkte, ${trk} Stiche</p>`;
        });
        summaryZone.innerHTML = html;
    }

    // DIREKTE ÜBERMITTLUNG ALLER DATEN AN GOOGLE FORMS PER URL-ENCODED PARAMETERS
    finalSaveBtn.addEventListener("click", () => {
        finalSaveBtn.textContent = "Wird gespeichert...";
        finalSaveBtn.disabled = true;

        const soloVal = document.querySelector('input[name="solo-player"]:checked').value;
        const wedVal = document.querySelector('input[name="wedding-player"]:checked').value;

        const s1 = document.getElementById("modal-step-3");
        const s2 = document.getElementById("modal-step-4");
        const s3 = document.getElementById("modal-step-5");
        const s4 = document.getElementById("modal-step-6");

        // Holt das Kartendatum aus dem UI (z.B. "23.05.2026")
        const gameDateEl = document.querySelector('.game-date');
        let gameDateVal = gameDateEl ? gameDateEl.textContent : '';

        // Konvertiert "DD.MM.YYYY" zu "YYYY-MM-DD", damit Google Forms das Datum schluckt
        if (gameDateVal && gameDateVal.includes('.')) {
            const parts = gameDateVal.split('.');
            if (parts.length === 3) {
                gameDateVal = `${parts[2]}-${parts[1]}-${parts[0]}`; 
            }
        } else {
            gameDateVal = new Date().toISOString().split('T')[0];
        }

        // BERECHNUNG: Neue Rundennummer ermitteln (Bestehende Runde + 1)
        const neueRundenNummer = aktuelleRundenNummer + 1;

        // Umstellung auf URLSearchParams (Inhaltstyp für Google Forms)
        const params = new URLSearchParams();
        
        // Spieldaten & Modi
        params.append(entryIds.spiel_datum, gameDateVal);
        params.append(entryIds.runden_gesamt, aktuelleGesamtRunden);
        params.append(entryIds.aktuelle_runde, neueRundenNummer); // Schickt jetzt automatisch die erhöhte Zahl (z.B. 0+1=1, oder 2+1=3)
        params.append(entryIds.solo, soloVal);
        params.append(entryIds.hochzeit, wedVal);
        
        // Spieler 1
        params.append(entryIds.s1_name, aktuellesSpielerArray[0]);
        params.append(entryIds.s1_punkte, s1.querySelector(".p-points").value);
        params.append(entryIds.s1_stiche, s1.querySelector(".p-tricks").value);
        
        // Spieler 2
        params.append(entryIds.s2_name, aktuellesSpielerArray[1]);
        params.append(entryIds.s2_punkte, s2.querySelector(".p-points").value);
        params.append(entryIds.s2_stiche, s2.querySelector(".p-tricks").value);
        
        // Spieler 3
        params.append(entryIds.s3_name, aktuellesSpielerArray[2]);
        params.append(entryIds.s3_punkte, s3.querySelector(".p-points").value);
        params.append(entryIds.s3_stiche, s3.querySelector(".p-tricks").value);
        
        // Spieler 4
        params.append(entryIds.s4_name, aktuellesSpielerArray[3]);
        params.append(entryIds.s4_punkte, s4.querySelector(".p-points").value);
        params.append(entryIds.s4_stiche, s4.querySelector(".p-tricks").value);

        const targetUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

        fetch(targetUrl, {
            method: "POST",
            mode: "no-cors", 
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString() 
        })
        .then(() => {
            finalSaveBtn.textContent = "Runde Speichern";
            finalSaveBtn.disabled = false;
            showStep(8); 
        })
        .catch(error => {
            console.error("Fehler beim Absenden des Formulars:", error);
            alert("Fehler beim Übertragen der Daten.");
            finalSaveBtn.textContent = "Runde Speichern";
            finalSaveBtn.disabled = false;
        });
    });

    superBtn.addEventListener("click", () => {
        modal.classList.remove("open");
    });

    closeX.addEventListener("click", () => modal.classList.remove("open"));
    window.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });

    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            if (lines.length <= 1) return;

            const idxDatum = 1, idxRundenGesamt = 2, idxAktuelleRunde = 3;
            const idxSp1 = 4, idxSp2 = 5, idxSp3 = 6, idxSp4 = 7;
            
            // Indizes für die Punkte der Spieler im Google Sheet (Name steht in Spalte, Punkte folgend)
            // Passe diese Zahlen an, wenn die Punktestand-Spalten anders verschoben sind!
            const idxSp1Pkt = 8, idxSp2Pkt = 9, idxSp3Pkt = 10, idxSp4Pkt = 11; 

            const gamesGrouped = {};

            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVRow(lines[i]);
                if (row.length <= idxSp4) continue;
                const datum = row[idxDatum];
                if (!datum) continue;

                const rundenGesamt = parseInt(row[idxRundenGesamt]) || 0;
                const aktuelleRunde = parseInt(row[idxAktuelleRunde]) || 0;
                const spielerListe = [row[idxSp1], row[idxSp2], row[idxSp3], row[idxSp4]].filter(Boolean);

                // Punkte aus dieser Zeile auslesen (0 falls leer)
                const p1 = parseInt(row[idxSp1Pkt]) || 0;
                const p2 = parseInt(row[idxSp2Pkt]) || 0;
                const p3 = parseInt(row[idxSp3Pkt]) || 0;
                const p4 = parseInt(row[idxSp4Pkt]) || 0;

                if (!gamesGrouped[datum]) {
                    gamesGrouped[datum] = {
                        datum, rundenGesamt, aktuelleRunde,
                        spielerString: spielerListe.join(', '),
                        spielerArray: spielerListe,
                        punkte: [0, 0, 0, 0] // Start bei 0 Punkten
                    };
                }

                // Alle Rundenpunkte für dieses Datum aufsummieren
                gamesGrouped[datum].punkte[0] += p1;
                gamesGrouped[datum].punkte[1] += p2;
                gamesGrouped[datum].punkte[2] += p3;
                gamesGrouped[datum].punkte[3] += p4;

                // Sucht automatisch nach der höchsten Zahl bei der aktuellen Runde für dieses Datum
                if (aktuelleRunde > gamesGrouped[datum].aktuelleRunde) {
                    gamesGrouped[datum].aktuelleRunde = aktuelleRunde;
                    gamesGrouped[datum].rundenGesamt = rundenGesamt;
                    gamesGrouped[datum].spielerString = spielerListe.join(', ');
                    gamesGrouped[datum].spielerArray = spielerListe;
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

                // Erstellt die HTML-Zeilen für die Namensliste mit Punktestand
                let punkteHtml = '<div class="game-scores" style="margin-top: 12px; font-size: 14px; color: #ccc; border-top: 1px solid #333; padding-top: 8px;">';
                game.spielerArray.forEach((name, idx) => {
                    punkteHtml += `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                        <span>${name}</span>
                        <span style="font-weight: bold; color: whitesmoke;">${game.punkte[idx]} Punkte</span>
                    </div>`;
                });
                punkteHtml += '</div>';

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
                        ${punkteHtml}
                    </div>
                    <div class="game-card-footer"><button class="btn-continue">Weiter spielen</button></div>
                `;

                card.querySelector('.btn-continue').addEventListener('click', () => openModal(game.spielerArray, game.rundenGesamt, game.aktuelleRunde));
                gamesListContainer.appendChild(card);
            });

            if (window.lucide) lucide.createIcons();
        });
});