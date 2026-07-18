document.addEventListener('DOMContentLoaded', () => {
    // 1. Elemente referenzieren
    const gameModal = document.getElementById("game-modal");
    const closeX = document.getElementById("close-modal-x");
    const superBtn = document.getElementById("super-btn");
    const gamesList = document.getElementById('open-games-list');
    const soloList = document.getElementById("modal-solo-list");
    const teamList = document.getElementById("modal-team-list");
    
    const formId = '1FAIpQLSfayGd2q3Xnxz1-YmMeiuXoNk6yYLZQ_gNO-7Sv_wT4oI4IMw';
 
    const entryIds = {
        spiel_datum: 'entry.824360719', 
        punkte_gesamt: 'entry.955427977', 
        aktuelle_runde: 'entry.1282541600',
        solo: 'entry.1248216577', 
        faktor: 'entry.1745650205',
        s1_name: 'entry.1406870107', s1_punkte: 'entry.972361183', s1_team: 'entry.238014956',
        s2_name: 'entry.1764879843', s2_punkte: 'entry.1952914660', s2_team: 'entry.505390666',
        s3_name: 'entry.132908103', s3_punkte: 'entry.1224263999', s3_team: 'entry.693981030',
        s4_name: 'entry.36076733', s4_punkte: 'entry.957057574', s4_team: 'entry.1960997850',
        spiel_status: 'entry.1780685435'
    };
 
    // --- Hilfsfunktionen ---
    const renderSoloOptions = (spielerArray) => {
        soloList.innerHTML = `<div style="grid-column: span 2;" class="radio-wrapper"><input type="radio" name="solo-player" id="solo-none" value="keins" class="player-radio-btn" checked><label for="solo-none" class="player-label">Kein Solo</label></div>`;
        spielerArray.forEach((s, i) => {
            soloList.innerHTML += `<div class="radio-wrapper"><input type="radio" name="solo-player" id="solo-${i}" value="${s}" class="player-radio-btn"><label for="solo-${i}" class="player-label">${s}</label></div>`;
        });
    };
 
    const renderTeamOptions = (spielerArray) => {
        teamList.innerHTML = "";
        spielerArray.forEach((s, i) => {
            teamList.innerHTML += `<div class="radio-wrapper"><input type="checkbox" id="team-${i}" value="${s}" class="player-radio-btn team-player"><label for="team-${i}" class="player-label">${s}</label></div>`;
        });
    };
 
const berechnePunkte = () => {
        const inputPunkte = parseInt(document.getElementById('modal-points-input').value);
        const soloPlayer = document.querySelector('input[name="solo-player"]:checked')?.value || "keins";
        const teamRe = Array.from(document.querySelectorAll('.team-player:checked')).map(cb => cb.value);
        const gewinnerTeam = document.querySelector('input[name="winning-team"]:checked')?.value;
        const istSolo = soloPlayer !== "keins";
        const faktor = istSolo ? 3 : 1;
        let ergebnisse = {};

        window.activeGameForContinue.spielerArray.forEach(spieler => {
            const inTeamRe = teamRe.includes(spieler);
            const istGewinner = (gewinnerTeam === "Re" && inTeamRe) || (gewinnerTeam === "Kontra" && !inTeamRe);
            
            if (istGewinner) {
                // Sonderfall: Kontra gewinnt ein Solo -> Kontra-Spieler erhalten einfache Punkte
                if (istSolo && gewinnerTeam === "Kontra") {
                    ergebnisse[spieler] = inputPunkte;
                } else {
                    // Normaler Gewinn (Solo-Spieler gewinnt ODER normales team-basiertes Spiel)
                    ergebnisse[spieler] = inputPunkte * faktor;
                }
            } else {
                // Sonderfall: Re verliert das Solo -> Solo-Spieler zahlt den dreifachen Satz
                if (istSolo && gewinnerTeam === "Kontra") {
                    ergebnisse[spieler] = -(inputPunkte * faktor);
                } else {
                    // Normaler Verlust
                    ergebnisse[spieler] = -inputPunkte;
                }
            }
        });
        return { ergebnisse, faktor, gewinnerTeam, teamRe, soloPlayer };
    };
 
    // --- Event Listener ---
    gamesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-continue')) {
            const card = e.target.closest('.game-card');
            window.activeGameForContinue = JSON.parse(card.dataset.gameInfo);
            window.activeGameForContinue.aktuelleRunde = Number(window.activeGameForContinue.aktuelleRunde);
            
            renderSoloOptions(window.activeGameForContinue.spielerArray);
            renderTeamOptions(window.activeGameForContinue.spielerArray);
            gameModal.classList.add('open');
            document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
            document.getElementById('modal-step-1').classList.add('active');
        }
    });
 
    gameModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('next-step-btn')) {
            const currentStep = e.target.closest('.modal-step');
            const nextStep = document.getElementById('modal-step-' + (parseInt(currentStep.id.split('-')[2]) + 1));
            if (nextStep) { currentStep.classList.remove('active'); nextStep.classList.add('active'); }
        }
 
        if (e.target.classList.contains('back-btn')) {
            const currentStep = e.target.closest('.modal-step');
            const prevStepId = parseInt(currentStep.id.split('-')[2]) - 1;
            const prevStep = document.getElementById('modal-step-' + prevStepId);
            if (prevStep) {
                currentStep.classList.remove('active');
                prevStep.classList.add('active');
            }
        }
 
        if (e.target.id === 'final-save-btn') {
            const { ergebnisse, faktor, gewinnerTeam, teamRe, soloPlayer } = berechnePunkte();
            const game = window.activeGameForContinue;
            const neueRunde = game.aktuelleRunde + 1;
 
            let bodyParts = [];
            bodyParts.push(`${entryIds.spiel_datum}=${encodeURIComponent(game.datum)}`);
            bodyParts.push(`${entryIds.punkte_gesamt}=${encodeURIComponent(document.getElementById('modal-points-input').value)}`);
            bodyParts.push(`${entryIds.aktuelle_runde}=${encodeURIComponent(neueRunde)}`);
            
            game.spielerArray.forEach((name, i) => bodyParts.push(`${entryIds[`s${i+1}_name`]}=${encodeURIComponent(name)}`));
            game.spielerArray.forEach((name) => bodyParts.push(`${entryIds[`s${Object.keys(ergebnisse).indexOf(name)+1}_punkte`]}=${encodeURIComponent(ergebnisse[name])}`));
            game.spielerArray.forEach((name, i) => bodyParts.push(`${entryIds[`s${i+1}_team`]}=${encodeURIComponent(teamRe.includes(name) ? "Re" : "Kontra")}`));
            
            bodyParts.push(`${entryIds.solo}=${encodeURIComponent(soloPlayer)}`);
            bodyParts.push(`${entryIds.faktor}=${encodeURIComponent(faktor)}`);
            bodyParts.push(`${entryIds.spiel_status}=${encodeURIComponent(gewinnerTeam)}`);
 
            fetch(`https://docs.google.com/forms/d/e/${formId}/formResponse`, {
                method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: bodyParts.join('&')
            }).then(() => {
                const successStep = document.getElementById('modal-step-6');
                
                // Zusammenfassung nur einfügen, wenn sie noch nicht existiert
                if (!successStep.querySelector('#dynamic-summary')) {
                    successStep.insertAdjacentHTML('beforeend', `
                        <div id="dynamic-summary" style="text-align: left; margin: 15px 0;">
                            <p><strong>Solo:</strong> ${soloPlayer === "keins" ? "Kein" : soloPlayer} | <strong>Sieger:</strong> ${gewinnerTeam}</p>
                            <ul style="list-style: none; padding: 0;">
                                ${game.spielerArray.map(s => {
                                    const delta = ergebnisse[s];
                                    const text = delta === 0 ? "Genau im Plan!" : delta > 0 ? `+${delta}` : `${delta}`;
                                    const color = delta === 0 ? "white" : delta > 0 ? "#699169" : "#a8583a";
                                    return `<li style="color:${color}; font-weight:bold;">${s}: ${text}</li>`;
                                }).join('')}
                            </ul>
                        </div>
                    `);
                }
                
                document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
                successStep.classList.add('active');
            }).catch(err => alert("Fehler: " + err));
        }
    });
 
    closeX.addEventListener('click', () => gameModal.classList.remove('open'));
    superBtn.addEventListener('click', () => { gameModal.classList.remove('open'); location.reload(); });
});