document.addEventListener('DOMContentLoaded', () => {
    const bestenlisteContainer = document.getElementById('open-bestenliste');
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQpR0kGrSSxQ_texguYbMzYwGyUBHgBPCeKjk_dL8bgVRp2IaF5X10V-kq-i_BTj0PJPDiiRsqZbby0/pub?gid=1523607497&single=true&output=csv';

    if (!bestenlisteContainer) return;

    // Hilfsfunktion zum sauberen Parsen der CSV-Zeilen (berücksichtigt Anführungszeichen)
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

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Netzwerkfehler beim Laden der Tabelle.');
            return response.text();
        })
        .then(csvText => {
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            if (lines.length <= 1) {
                bestenlisteContainer.innerHTML = '<div class="no-games">Keine Daten gefunden.</div>';
                return;
            }

            // Spalten-Indizes
            const idxSp1 = 4;           // Spalte E (Name Spieler 1)
            const idxSp2 = 5;           // Spalte F (Name Spieler 2)
            const idxSp3 = 6;           // Spalte G (Name Spieler 3)
            const idxSp4 = 7;           // Spalte H (Name Spieler 4)
            
            const idxPunkteSp1 = 8;     // Spalte I (Punkte Spieler 1)
            const idxPunkteSp2 = 9;     // Spalte J (Punkte Spieler 2)
            const idxPunkteSp3 = 10;    // Spalte K (Punkte Spieler 3)
            const idxPunkteSp4 = 11;    // Spalte L (Punkte Spieler 4)
            
            const idxSolo = 16;         // Spalte Q (Solo?)

            const playerStats = {};

            function ensurePlayerExists(name) {
                if (!name || name.toLowerCase().startsWith('spieler') || name === "" || name.toLowerCase() === "keins") return null;
                if (!playerStats[name]) {
                    playerStats[name] = {
                        name: name,
                        punkte: 0,
                        solos: 0
                    };
                }
                return name;
            }

            // Alle Zeilen durchgehen
            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVRow(lines[i]);
                if (row.length < idxSolo) continue;

                const name1 = row[idxSp1] ? row[idxSp1].trim() : "";
                const name2 = row[idxSp2] ? row[idxSp2].trim() : "";
                const name3 = row[idxSp3] ? row[idxSp3].trim() : "";
                const name4 = row[idxSp4] ? row[idxSp4].trim() : "";

                ensurePlayerExists(name1);
                ensurePlayerExists(name2);
                ensurePlayerExists(name3);
                ensurePlayerExists(name4);

                // Punkte addieren
                if (playerStats[name1]) playerStats[name1].punkte += parseInt(row[idxPunkteSp1]) || 0;
                if (playerStats[name2]) playerStats[name2].punkte += parseInt(row[idxPunkteSp2]) || 0;
                if (playerStats[name3]) playerStats[name3].punkte += parseInt(row[idxPunkteSp3]) || 0;
                if (playerStats[name4]) playerStats[name4].punkte += parseInt(row[idxPunkteSp4]) || 0;

                // Solos auswerten
                const soloName = row[idxSolo] ? row[idxSolo].trim() : "";
                if (soloName && soloName.toLowerCase() !== "keins" && playerStats[soloName]) {
                    playerStats[soloName].solos += 1;
                }
            }

            // Sortieren (Punkte -> Name)
            const leaderboard = Object.values(playerStats).sort((a, b) => {
                if (b.punkte !== a.punkte) return b.punkte - a.punkte;
                return a.name.localeCompare(b.name);
            });

            if (leaderboard.length === 0) {
                bestenlisteContainer.innerHTML = '<div class="no-games">Keine gültigen Spieler gefunden.</div>';
                return;
            }

            // Tabelle aufbauen
            let tableHTML = `
                <div class="table-responsive">
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th style="text-align: center;">#</th>
                                <th>Name</th>
                                <th>Punkte</th>
                                <th style="text-align: center;">Solos</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            leaderboard.forEach((pData, index) => {
                const rank = index + 1;
                const scoreColor = pData.punkte === 0 ? "white" : pData.punkte > 0 ? "#13c913" : "#FF4500";
                const scoreText = pData.punkte > 0 ? `+${pData.punkte}` : pData.punkte;

                let posInhalt = `<span class="pos-badge">${rank}</span>`;
                if (rank === 1 && pData.punkte !== 0) {
                    posInhalt = `<i data-lucide="crown" class="crown-icon-pos"></i>`;
                }

                tableHTML += `
                    <tr>
                        <td class="pos-cell">${posInhalt}</td>
                        <td class="player-name-cell">${pData.name}</td>
                        <td class="points-cell" style="color: ${scoreColor}; font-weight: normal;">
                            ${scoreText}
                        </td>
                        <td class="center-cell" data-label="Solos"><span class="stat-value">${pData.solos}</span></td>
                    </tr>
                `;
            });

            tableHTML += `</tbody></table></div>`;
            bestenlisteContainer.innerHTML = tableHTML;

            if (window.lucide) {
                lucide.createIcons();
            }
        })
        .catch(error => {
            console.error(error);
            bestenlisteContainer.innerHTML = '<div class="error-text">Fehler beim Laden der Tabellen-Statistiken.</div>';
        });
});