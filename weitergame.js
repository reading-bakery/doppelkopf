document.addEventListener('DOMContentLoaded', () => {
    const gamesListContainer = document.getElementById('open-games-list');
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQpR0kGrSSxQ_texguYbMzYwGyUBHgBPCeKjk_dL8bgVRp2IaF5X10V-kq-i_BTj0PJPDiiRsqZbby0/pub?gid=1523607497&single=true&output=csv';
    
    // ==========================================
    // DEINE GOOGLE FORMULAR CONFIG
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
        s4_stiche: 'entry.1960997850',
        
        spiel_status: 'entry.1780685435'
    };
    // ==========================================

    // Modal Haupt-Elemente
    const modal = document.getElementById("game-modal");
    const closeX = document.getElementById("close-modal-x");
    const superBtn = document.getElementById("super-btn");
    const finalSaveBtn = document.getElementById("final-save-btn");

    // Bestätigungs-Modal Elemente
    const confirmModal = document.getElementById("confirm-modal");
    const confirmYesBtn = document.getElementById("confirm-yes-btn");
    const confirmNoBtn = document.getElementById("confirm-no-btn");
    
    // Temporärer Speicher für die zu löschende Karte und deren Spieldaten
    let cardToHide = null; 
    let activeGameData = null;

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
        aktuelleGesamtRunden = Number(rundenGesamt) || 0; 
        aktuelleRundenNummer = Number(aktuelleRunde) || 0; 
        aktuellerSchritt = 1;

        // Solo-Liste
        const soloList = document.getElementById("modal-solo-list");
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

        // Team-Liste (RE)
// Team RE Liste
const teamList = document.getElementById("modal-team-list");

teamList.innerHTML = "";

spielerArray.forEach((s, i) => {
    teamList.innerHTML += `
        <div class="radio-wrapper">
            <input
                type="checkbox"
                id="team-${i}"
                value="${s}"
                class="player-radio-btn team-player">

            <label for="team-${i}" class="player-label">
                ${s}
            </label>
        </div>
    `;
});

// Maximal 2 Spieler auswählbar
teamList.querySelectorAll(".team-player").forEach(cb => {
    cb.addEventListener("change", () => {

        const checked =
            teamList.querySelectorAll(".team-player:checked");

        if (checked.length >= 2) {

            teamList.querySelectorAll(".team-player").forEach(input => {
                if (!input.checked) {
                    input.disabled = true;
                }
            });

        } else {

            teamList.querySelectorAll(".team-player").forEach(input => {
                input.disabled = false;
            });

        }
    });
});

        // Zusammenfassung zurücksetzen
const summaryZone = document.getElementById("summary-cards-zone");
if (summaryZone) {
    summaryZone.innerHTML = "";
}

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

    // Normales Speichern einer Runde
    finalSaveBtn.addEventListener("click", () => {
        finalSaveBtn.textContent = "Wird gespeichert...";
        finalSaveBtn.disabled = true;

        const soloVal = document.querySelector('input[name="solo-player"]:checked').value;
        const wedVal = document.querySelector('input[name="wedding-player"]:checked').value;

        const s1 = document.getElementById("modal-step-3");
        const s2 = document.getElementById("modal-step-4");
        const s3 = document.getElementById("modal-step-5");
        const s4 = document.getElementById("modal-step-6");

        const gameDateEl = document.querySelector('.game-date');
        let gameDateVal = gameDateEl ? gameDateEl.textContent : '';

        if (gameDateVal && gameDateVal.includes('.')) {
            const parts = gameDateVal.split('.');
            if (parts.length === 3) {
                gameDateVal = `${parts[2]}-${parts[1]}-${parts[0]}`; 
            }
        } else {
            gameDateVal = new Date().toISOString().split('T')[0];
        }

        const neueRundenNummer = aktuelleRundenNummer + 1;
        const params = new URLSearchParams();
        
        params.append(entryIds.spiel_datum, gameDateVal);
        params.append(entryIds.runden_gesamt, aktuelleGesamtRunden);
        params.append(entryIds.aktuelle_runde, neueRundenNummer); 
        params.append(entryIds.solo, soloVal);
        params.append(entryIds.hochzeit, wedVal);
        
        params.append(entryIds.s1_name, aktuellesSpielerArray[0]);
        params.append(entryIds.s1_punkte, s1.querySelector(".p-points").value);
        params.append(entryIds.s1_stiche, s1.querySelector(".p-tricks").value);
        
        params.append(entryIds.s2_name, aktuellesSpielerArray[1]);
        params.append(entryIds.s2_punkte, s2.querySelector(".p-points").value);
        params.append(entryIds.s2_stiche, s2.querySelector(".p-tricks").value);
        
        params.append(entryIds.s3_name, aktuellesSpielerArray[2]);
        params.append(entryIds.s3_punkte, s3.querySelector(".p-points").value);
        params.append(entryIds.s3_stiche, s3.querySelector(".p-tricks").value);
        
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
    window.addEventListener("click", (e) => { 
        if (e.target === modal) modal.classList.remove("open"); 
        if (e.target === confirmModal) confirmModal.classList.remove("open"); 
    });

    // Absenden des "beendet" Status über den Button
    if (confirmNoBtn && confirmYesBtn && confirmModal) {
        confirmNoBtn.addEventListener("click", () => {
            confirmModal.classList.remove("open");
            cardToHide = null;
            activeGameData = null;
        });

        confirmYesBtn.addEventListener("click", () => {
            if (cardToHide && activeGameData) {
                confirmYesBtn.textContent = "Wird beendet...";
                confirmYesBtn.disabled = true;

                const params = new URLSearchParams();
                params.append(entryIds.spiel_datum, activeGameData.datum);
                params.append(entryIds.runden_gesamt, activeGameData.rundenGesamt);
                params.append(entryIds.aktuelle_runde, "beendet"); // Schreibt "beendet" dorthin, wo es deine Tabelle erwartet!

                const targetUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

                fetch(targetUrl, {
                    method: "POST",
                    mode: "no-cors",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: params.toString()
                })
                .then(() => {
                    cardToHide.style.display = 'none'; 
                    confirmModal.classList.remove("open");
                })
                .catch(error => {
                    console.error("Fehler beim Beenden des Spiels:", error);
                    alert("Es gab ein Problem beim Übermitteln des Status.");
                })
                .finally(() => {
                    confirmYesBtn.textContent = "Ja";
                    confirmYesBtn.disabled = false;
                    cardToHide = null;
                    activeGameData = null;
                });
            }
        });
    }

    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            if (lines.length <= 1) return;

            const idxDatum = 1, idxRundenGesamt = 2, idxAktuelleRunde = 3;
            const idxSp1 = 4, idxSp2 = 5, idxSp3 = 6, idxSp4 = 7;
            const idxSp1Pkt = 8, idxSp2Pkt = 9, idxSp3Pkt = 10, idxSp4Pkt = 11;

            const gamesGrouped = {};
            const terminatedDates = new Set(); 

            // SCHRITT 1: FIX - "beendet" wird laut deinen Daten in Spalte 3 (idxAktuelleRunde) gespeichert!
            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVRow(lines[i]);
                if (row.length <= idxAktuelleRunde) continue;

                const datum = row[idxDatum].trim();
                const aktuelleRundeWert = row[idxAktuelleRunde].trim().toLowerCase();
                
                if (!datum) continue;

                if (aktuelleRundeWert === "beendet") {
                    terminatedDates.add(datum);
                }
            }

            // SCHRITT 2: Daten verarbeiten und gruppieren
            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVRow(lines[i]);
                if (row.length <= idxSp4) continue;
                
                const datum = row[idxDatum].trim();
                if (!datum) continue;

                // Falls der Wert "beendet" ist, überspringen wir diesen Eintrag beim Punkte-Zählen
                if (row[idxAktuelleRunde].trim().toLowerCase() === "beendet") continue;

                const rundenGesamt = parseInt(row[idxRundenGesamt]) || 0;
                const aktuelleRunde = parseInt(row[idxAktuelleRunde]) || 0;
                const spielerListe = [row[idxSp1], row[idxSp2], row[idxSp3], row[idxSp4]].filter(Boolean);

                if (spielerListe.length === 0) continue;

                const p1 = parseInt(row[idxSp1Pkt]) || 0;
                const p2 = parseInt(row[idxSp2Pkt]) || 0;
                const p3 = parseInt(row[idxSp3Pkt]) || 0;
                const p4 = parseInt(row[idxSp4Pkt]) || 0;

                const groupKey = datum;

                if (!gamesGrouped[groupKey]) {
                    gamesGrouped[groupKey] = {
                        datum, rundenGesamt, aktuelleRunde,
                        spielerString: spielerListe.join(', '),
                        spielerArray: spielerListe,
                        punkte: [0, 0, 0, 0] 
                    };
                }

                gamesGrouped[groupKey].punkte[0] += p1;
                gamesGrouped[groupKey].punkte[1] += p2;
                gamesGrouped[groupKey].punkte[2] += p3;
                gamesGrouped[groupKey].punkte[3] += p4;

                if (aktuelleRunde > gamesGrouped[groupKey].aktuelleRunde) {
                    gamesGrouped[groupKey].aktuelleRunde = aktuelleRunde;
                    gamesGrouped[groupKey].rundenGesamt = rundenGesamt;
                    gamesGrouped[groupKey].spielerString = spielerListe.join(', ');
                    gamesGrouped[groupKey].spielerArray = spielerListe;
                }
            }

            // SCHRITT 3: FILTRATION MATCHEN
            const openGames = Object.values(gamesGrouped).filter(g => {
                const hatBeendetStatus = terminatedDates.has(g.datum);
                
                const aktuelleRundeNum = Number(g.aktuelleRunde);
                const rundenGesamtNum = Number(g.rundenGesamt);
                const rundenErreicht = aktuelleRundeNum >= rundenGesamtNum;

                // Nur wenn Max Runden voll UND die beendet-Zeile existiert -> ausblenden
                if (rundenErreicht && hatBeendetStatus) {
                    return false;
                }
                
                return true;
            });
            
            gamesListContainer.innerHTML = '';

            if (openGames.length === 0) {
                gamesListContainer.innerHTML = '<div class="no-games">Keine offenen Spiele vorhanden.</div>';
                return;
            }

            openGames.forEach(game => {
                let formatiertesDatum = game.datum;
                if (game.datum.includes('-')) {
                    const teile = game.datum.split('-');
                    formatiertesDatum = `${teile[2]}.${teile[1]}.${teile[0]}`;
                }
                const prozent = game.rundenGesamt > 0 ? (game.aktuelleRunde / game.rundenGesamt) * 100 : 0;

                const sortierteSpielerListe = game.spielerArray.map((name, idx) => {
                    return { name: name, punkte: game.punkte[idx] };
                }).sort((a, b) => b.punkte - a.punkte);

                let punkteHtml = '<div class="game-scores" style="margin-top: 12px; font-size: 14px; color: #ccc; border-top: 1px solid #333; padding-top: 8px;">';
                sortierteSpielerListe.forEach(spieler => {
                    punkteHtml += `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                        <span>${spieler.name}</span>
                        <span style="font-weight: bold; color: whitesmoke;">${spieler.punkte} Punkte</span>
                    </div>`;
                });
                punkteHtml += '</div>';

                const card = document.createElement('div');
                card.className = 'game-card';
                card.innerHTML = `
                    <div class="game-card-header">
                        <span class="game-date">${formatiertesDatum}</span>
                        <span class="game-progress">Runde ${game.aktuelleRunde}</span>
                    </div>
                    <div class="game-card-body">
                        <p class="game-players"><i data-lucide="users" class="icon-inline"></i> ${game.spielerString}</p>
                        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${prozent}%"></div></div>
                        ${punkteHtml}
                    </div>
                    <div class="game-card-footer buttons-split-row">
                        <button class="btn-continue">Weiter spielen</button>
                        <button class="btn-terminate" data-rawdate="${game.datum}" data-totalrounds="${game.rundenGesamt}">Beenden</button>
                    </div>
                `;

                card.querySelector('.btn-continue').addEventListener('click', () => openModal(game.spielerArray, game.rundenGesamt, game.aktuelleRunde));
                
                card.querySelector('.btn-terminate').addEventListener('click', (e) => {
                    cardToHide = card; 
                    activeGameData = { 
                        datum: e.currentTarget.getAttribute('data-rawdate'),
                        rundenGesamt: e.currentTarget.getAttribute('data-totalrounds')
                    }; 
                    if (confirmModal) {
                        confirmModal.classList.add("open");
                    }
                });

                gamesListContainer.appendChild(card);
            });

            if (window.lucide) lucide.createIcons();
        });
});