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
        spiel_datum: 'entry.824360719', punkte_gesamt: 'entry.955427977', aktuelle_runde: 'entry.1282541600',
        solo: 'entry.1248216577', faktor: 'entry.1745650205',
        s1_name: 'entry.1406870107', s1_punkte: 'entry.972361183', s1_team: 'entry.238014956',
        s2_name: 'entry.1764879843', s2_punkte: 'entry.1952914660', s2_team: 'entry.505390666',
        s3_name: 'entry.132908103', s3_punkte: 'entry.1224263999', s3_team: 'entry.693981030',
        s4_name: 'entry.36076733', s4_punkte: 'entry.957057574', s4_team: 'entry.1960997850',
        spiel_status: 'entry.1780685435'
    };

    const closeModal = (m) => m.classList.remove('open');

    // Hilfsfunktion: Solo-Optionen rendern
    const renderSoloOptions = (spielerArray) => {
        soloList.innerHTML = `<div style="grid-column: span 2;" class="radio-wrapper">
            <input type="radio" name="solo-player" id="solo-none" value="keins" class="player-radio-btn" checked>
            <label for="solo-none" class="player-label">Kein Solo</label></div>`;
        spielerArray.forEach((s, i) => {
            soloList.innerHTML += `<div class="radio-wrapper"><input type="radio" name="solo-player" id="solo-${i}" value="${s}" class="player-radio-btn">
                <label for="solo-${i}" class="player-label">${s}</label></div>`;
        });
    };

    // Hilfsfunktion: Team-Optionen rendern
    const renderTeamOptions = (spielerArray) => {
        teamList.innerHTML = "";
        spielerArray.forEach((s, i) => {
            teamList.innerHTML += `<div class="radio-wrapper">
                <input type="checkbox" id="team-${i}" value="${s}" class="player-radio-btn team-player">
                <label for="team-${i}" class="player-label">${s}</label></div>`;
        });
        teamList.querySelectorAll(".team-player").forEach(cb => {
            cb.addEventListener("change", () => {
                const checked = teamList.querySelectorAll(".team-player:checked");
                teamList.querySelectorAll(".team-player").forEach(input => {
                    input.disabled = (checked.length >= 2 && !input.checked);
                });
            });
        });
    };

    // Spiel-Logik (Punkte berechnen)
    const berechnePunkte = () => {
        const game = window.activeGameForContinue;
        const inputPunkte = parseInt(game.neuePunkte);
        const soloPlayer = document.querySelector('input[name="solo-player"]:checked')?.value || "keins";
        const teamRe = Array.from(document.querySelectorAll('.team-player:checked')).map(cb => cb.value);
        const gewinnerTeam = document.querySelector('input[name="winning-team"]:checked')?.value;
        const faktor = (soloPlayer !== "keins") ? 3 : 1;
        let ergebnisse = {};

        game.spielerArray.forEach(spieler => {
            const inTeamRe = teamRe.includes(spieler);
            const istGewinner = (gewinnerTeam === "Re" && inTeamRe) || (gewinnerTeam === "Kontra" && !inTeamRe);
            ergebnisse[spieler] = istGewinner ? (inputPunkte * faktor) : (-inputPunkte);
        });
        return { ergebnisse, faktor, gewinnerTeam, teamRe, soloPlayer };
    };

    // 2. Events: Klick auf "Weiterspielen"
    gamesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-continue')) {
            const card = e.target.closest('.game-card');
            window.activeGameForContinue = JSON.parse(card.dataset.gameInfo);
            renderSoloOptions(window.activeGameForContinue.spielerArray);
            renderTeamOptions(window.activeGameForContinue.spielerArray);
            gameModal.classList.add('open');
            document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
            document.getElementById('modal-step-1').classList.add('active');
        }
    });

    // 3. Navigation & Speichern
    gameModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('back-btn')) {
            const currentStep = e.target.closest('.modal-step');
            const prevStep = document.getElementById('modal-step-' + (parseInt(currentStep.id.split('-')[2]) - 1));
            if (prevStep) { currentStep.classList.remove('active'); prevStep.classList.add('active'); }
        }

        if (e.target.classList.contains('next-step-btn')) {
            const currentStep = e.target.closest('.modal-step');
            if (currentStep.id === 'modal-step-1') {
                const punkte = document.getElementById('modal-points-input').value;
                if (!punkte) return alert("Punkte eingeben!");
                window.activeGameForContinue.neuePunkte = punkte;
            }
            const nextStep = document.getElementById('modal-step-' + (parseInt(currentStep.id.split('-')[2]) + 1));
            if (nextStep) { currentStep.classList.remove('active'); nextStep.classList.add('active'); }
        }

        // Finaler Speichervorgang
        if (e.target.id === 'final-save-btn') {
            const { ergebnisse, faktor, gewinnerTeam, teamRe, soloPlayer } = berechnePunkte();
            const game = window.activeGameForContinue;
            const params = new URLSearchParams();
            params.append(entryIds.spiel_datum, game.datum);
            params.append(entryIds.punkte_gesamt, game.neuePunkte);
            params.append(entryIds.solo, soloPlayer);
            params.append(entryIds.faktor, faktor);
            game.spielerArray.forEach((name, i) => {
                params.append(entryIds[`s${i+1}_name`], name);
                params.append(entryIds[`s${i+1}_punkte`], ergebnisse[name]);
                params.append(entryIds[`s${i+1}_team`], teamRe.includes(name) ? "Re" : "Kontra");
            });

            fetch(`https://docs.google.com/forms/d/e/${formId}/formResponse`, {
                method: "POST", mode: "no-cors", body: params.toString()
            }).then(() => {
                document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
                document.getElementById('modal-step-6').classList.add('active');
            }).catch(err => alert("Fehler: " + err));
        }
    });

    closeX.addEventListener('click', () => closeModal(gameModal));
    superBtn.addEventListener('click', () => { closeModal(gameModal); location.reload(); });
});