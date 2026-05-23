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

            // Spalten-Indizes laut deiner Tabellenstruktur
            const idxSp1 = 3;            // Spalte D (Name Spieler 1)
            const idxSp2 = 4;            // Spalte E (Name Spieler 2)
            const idxSp3 = 5;            // Spalte F (Name Spieler 3)
            const idxSp4 = 6;            // Spalte G (Name Spieler 4)
            
            const idxPunkteSp1 = 8;      // Spalte I (Punkte Spieler 1)
            const idxPunkteSp2 = 9;      // Spalte J (Punkte Spieler 2)
            const idxPunkteSp3 = 10;     // Spalte K (Punkte Spieler 3)
            const idxPunkteSp4 = 11;     // Spalte L (Punkte Spieler 4)
            
            const idxSolo = 12;          // Spalte M (Solo?)
            const idxStich = 13;         // Spalte N (Stich)
            const idxHochzeit = 14;      // Spalte O (Hochzeit) <- Neu angelegt direkt nach Stich

            // Ein dynamisches Objekt für ALLE Spieler, die jemals mitspielen
            const playerStats = {};

            // Helper, um einen Spieler im System zu registrieren
            function ensurePlayerExists(name) {
                if (!name || name.toLowerCase().startsWith('spieler') || name === "") return null;
                if (!playerStats[name]) {
                    playerStats[name] = {
                        name: name,
                        punkte: 0,
                        stiche: 0,
                        solos: 0,
                        hochzeiten: 0
                    };
                }
                return name;
            }

            // Alle Zeilen (Runden) der CSV durchgehen
            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVRow(lines[i]);
                
                // Abbruchbedingung auf die neue maximale Spalte angepasst
                if (row.length < idxHochzeit) continue;

                // Namen auslesen und von Leerzeichen befreien
                const name1 = row[idxSp1] ? row[idxSp1].trim() : "";
                const name2 = row[idxSp2] ? row[idxSp2].trim() : "";
                const name3 = row[idxSp3] ? row[idxSp3].trim() : "";
                const name4 = row[idxSp4] ? row[idxSp4].trim() : "";

                // Spieler dynamisch registrieren
                ensurePlayerExists(name1);
                ensurePlayerExists(name2);
                ensurePlayerExists(name3);
                ensurePlayerExists(name4);

                // Punkte basierend auf der Position addieren
                if (playerStats[name1]) playerStats[name1].punkte += parseInt(row[idxPunkteSp1]) || 0;
                if (playerStats[name2]) playerStats[name2].punkte += parseInt(row[idxPunkteSp2]) || 0;
                if (playerStats[name3]) playerStats[name3].punkte += parseInt(row[idxPunkteSp3]) || 0;
                if (playerStats[name4]) playerStats[name4].punkte += parseInt(row[idxPunkteSp4]) || 0;

                // Numerische Auswertung (1 = Spieler 1, 2 = Spieler 2, etc.)
                const soloPosition = parseInt(row[idxSolo]) || 0;
                const stichPosition = parseInt(row[idxStich]) || 0;
                const hochzeitPosition = parseInt(row[idxHochzeit]) || 0;

                // 1. Solos zuweisen
                if (soloPosition === 1 && playerStats[name1]) playerStats[name1].solos += 1;
                if (soloPosition === 2 && playerStats[name2]) playerStats[name2].solos += 1;
                if (soloPosition === 3 && playerStats[name3]) playerStats[name3].solos += 1;
                if (soloPosition === 4 && playerStats[name4]) playerStats[name4].solos += 1;

                // 2. Stiche zuweisen
                if (stichPosition === 1 && playerStats[name1]) playerStats[name1].stiche += 1;
                if (stichPosition === 2 && playerStats[name2]) playerStats[name2].stiche += 1;
                if (stichPosition === 3 && playerStats[name3]) playerStats[name3].stiche += 1;
                if (stichPosition === 4 && playerStats[name4]) playerStats[name4].stiche += 1;

                // 3. Hochzeiten zuweisen (Neu)
                if (hochzeitPosition === 1 && playerStats[name1]) playerStats[name1].hochzeiten += 1;
                if (hochzeitPosition === 2 && playerStats[name2]) playerStats[name2].hochzeiten += 1;
                if (hochzeitPosition === 3 && playerStats[name3]) playerStats[name3].hochzeiten += 1;
                if (hochzeitPosition === 4 && playerStats[name4]) playerStats[name4].hochzeiten += 1;
            }

            // Alle Spieler umwandeln und stabil sortieren (Punkte -> Stiche -> Name)
            const leaderboard = Object.values(playerStats).sort((a, b) => {
                if (b.punkte !== a.punkte) return b.punkte - a.punkte;
                if (b.stiche !== a.stiche) return b.stiche - a.stiche;
                return a.name.localeCompare(b.name);
            });

            if (leaderboard.length === 0) {
                bestenlisteContainer.innerHTML = '<div class="no-games">Keine gültigen Spieler gefunden.</div>';
                return;
            }

            // Tabellen-Grundgerüst aufbauen
            let tableHTML = `
                <div class="table-responsive">
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th style="text-align: center;">Pos.</th>
                                <th>Name</th>
                                <th>Punkte</th>
                                <th>Stiche</th>
                                <th>Solos</th>
                                <th>Hochzeiten</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            // Tabellenzeilen für alle sortierten Spieler generieren
            leaderboard.forEach((pData, index) => {
                const rank = index + 1;
                
                // Wunsch-Farblogik für die Punkte (deltaColor)
                const scoreColor = pData.punkte === 0 ? "white" : pData.punkte > 0 ? "#13c913" : "#FF4500";
                const scoreText = pData.punkte > 0 ? `+${pData.punkte}` : pData.punkte;

                // Krone setzen, wenn es Platz 1 ist (und Punkte nicht 0 sind)
                let posInhalt = `<span class="pos-badge">${rank}</span>`;
                if (rank === 1 && pData.punkte !== 0) {
                    posInhalt = `<i data-lucide="crown" class="crown-icon-pos"></i>`;
                }

                tableHTML += `
                    <tr>
                        <td class="pos-cell">${posInhalt}</td>
                        <td class="player-name-cell">${pData.name}</td>
                        <td style="color: ${scoreColor}; font-weight: bold; font-family: 'Rubik Mono One', sans-serif;">${scoreText}</td>
                        <td>${pData.stiche}</td>
                        <td>${pData.solos}</td>
                        <td>${pData.hochzeiten}</td>
                    </tr>
                `;
            });

            tableHTML += `
                        </tbody>
                    </table>
                </div>
            `;

            // HTML in den DOM-Container injizieren
            bestenlisteContainer.innerHTML = tableHTML;

            // Lucide Icons initialisieren
            if (window.lucide) {
                lucide.createIcons();
            }
        })
        .catch(error => {
            console.error(error);
            bestenlisteContainer.innerHTML = '<div class="error-text">Fehler beim Laden der Tabellen-Statistiken.</div>';
        });
});