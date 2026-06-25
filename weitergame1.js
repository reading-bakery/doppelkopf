document.addEventListener('DOMContentLoaded', () => {
    const gamesListContainer = document.getElementById('open-games-list');
    const modal = document.getElementById('confirm-modal');
    const btnYes = document.getElementById('confirm-yes-btn');
    const btnNo = document.getElementById('confirm-no-btn');
    let activeGameData = null;

    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQpR0kGrSSxQ_texguYbMzYwGyUBHgBPCeKjk_dL8bgVRp2IaF5X10V-kq-i_BTj0PJPDiiRsqZbby0/pub?gid=1523607497&single=true&output=csv';
    const formId = '1FAIpQLSfayGd2q3Xnxz1-YmMeiuXoNk6yYLZQ_gNO-7Sv_wT4oI4IMw'; 
    const entryIds = {
        spiel_datum: 'entry.824360719',
        punkte_gesamt: 'entry.955427977',
        aktuelle_runde: 'entry.1282541600'
    };

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

    // Modal Events
    btnNo.addEventListener('click', () => {
        modal.classList.remove('open');
        activeGameData = null;
    });

    btnYes.addEventListener('click', () => {
        if (!activeGameData) return;
        const { datum, rundenGesamt, cardElement } = activeGameData;
        const params = new URLSearchParams();
        params.append(entryIds.spiel_datum, datum);
        params.append(entryIds.punkte_gesamt, rundenGesamt);
        params.append(entryIds.aktuelle_runde, "beendet");

        fetch(`https://docs.google.com/forms/d/e/${formId}/formResponse`, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString()
        }).then(() => {
            cardElement.style.display = 'none';
            modal.classList.remove('open');
            // Prüfen, ob noch Karten da sind
            if (document.querySelectorAll('.game-card:not([style*="display: none"])').length === 0) {
                gamesListContainer.innerHTML = '<p class="no-games-message">Keine offenen Spiele</p>';
            }
        }).catch(err => alert("Fehler: " + err));
    });

    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            const gamesGrouped = {};
            const terminatedDates = new Set();

            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVRow(lines[i]);
                if (row[3]?.trim().toLowerCase() === "beendet") terminatedDates.add(row[1].trim());
            }

            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVRow(lines[i]);
                if (row.length < 8 || row[3]?.trim().toLowerCase() === "beendet") continue;

                const datum = row[1].trim();
                let displayDate = datum;
                if (datum.includes('-')) {
                    const [y, m, d] = datum.split('-');
                    displayDate = `${d}.${m}.${y}`;
                }

                if (!gamesGrouped[datum]) {
                    gamesGrouped[datum] = {
                        datum, displayDate,
                        rundenGesamt: parseInt(row[2]) || 0, 
                        aktuelleRunde: 0,
                        spielerArray: [row[4], row[5], row[6], row[7]].filter(Boolean),
                        punkte: [0, 0, 0, 0]
                    };
                }
                for(let j=0; j<4; j++) gamesGrouped[datum].punkte[j] += parseInt(row[8+j]) || 0;
                gamesGrouped[datum].aktuelleRunde = Math.max(gamesGrouped[datum].aktuelleRunde, parseInt(row[3]) || 0);
            }

            const activeGames = Object.values(gamesGrouped).filter(game => !terminatedDates.has(game.datum));

            gamesListContainer.innerHTML = '';
            
            if (activeGames.length === 0) {
                gamesListContainer.innerHTML = '<p class="no-games-message">Keine offenen Spiele</p>';
            } else {
                activeGames.forEach(game => {
                    const card = document.createElement('div');
                    card.className = 'game-card';
                    
                    card.innerHTML = `
                        <div class="game-card-header" style="margin-bottom: 5px;">
                            <span style="font-family: 'Rubik Mono One'; color: whitesmoke; letter-spacing: -2px;">${game.displayDate}</span>
                            <span style="color: whitesmoke;">Runde ${game.aktuelleRunde}</span>
                        </div>
                        
                        <hr style="border: 0; border-top: 1px solid #444; margin: 0 0 5px 0;">
                        
                        <div class="game-card-body">
                            <p class="game-players" style="margin-bottom: 5px;">
                                <i data-lucide="users" class="icon-inline"></i> ${game.spielerArray.join(', ')}
                            </p>
                            
                            <hr style="border: 0; border-top: 1px solid #444; margin: 0 0 5px 0;">
                            
                            <div class="game-scores" style="margin-top: 5px; margin-bottom: 15px;">
                                ${game.spielerArray.map((name, i) => `
                                    <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                                        <span style="color: whitesmoke;">${name}</span>
                                        <span style="color: whitesmoke;"><b>${game.punkte[i]} Punkte</b></span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="game-card-footer" style="margin-top: 20px; display: flex; gap: 15px; padding-top: 10px; border-top: 1px solid #333;">
                            <button class="btn-continue" style="flex: 2; padding: 12px 0;">Weiterspielen</button>
                            <button class="btn-terminate" style="flex: 1; padding: 12px 0;">Beenden</button>
                        </div>
                    `;

                    card.querySelector('.btn-terminate').addEventListener('click', () => {
                        activeGameData = { datum: game.datum, rundenGesamt: game.rundenGesamt, cardElement: card };
                        modal.classList.add('open');
                    });

                    gamesListContainer.appendChild(card);
                });
            }

            if (window.lucide) lucide.createIcons();
        });
});