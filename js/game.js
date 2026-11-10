// Game Module: Mechanics, Physics, Turn Timer, Leaderboard & Game Loop

function createPlatform(x, w) {
    const buildingColors = ["#1e293b", "#27233a", "#3b1e22", "#1b302a", "#2c2a29"];
    const buildingColor = buildingColors[Math.floor(Math.random() * buildingColors.length)];
    const hasChimney = w >= 36;
    const chimneyOffset = hasChimney ? 8 + Math.floor(Math.random() * Math.max(1, w - 24)) : 0;

    const windowCols = Math.max(1, Math.floor((w - 10) / 14));
    const windowRows = 7;
    const windowLights = [];
    for (let i = 0; i < windowCols * windowRows; i++) {
        windowLights.push(Math.random() > 0.28);
    }

    return {
        x,
        w,
        buildingColor,
        hasChimney,
        chimneyOffset,
        windowCols,
        windowRows,
        windowLights
    };
}

function generatePlatform() {
    const minimumGap = 40;
    const maximumGap = 200;
    const minimumWidth = 20;
    const maximumWidth = 100;

    const lastPlatform = platforms[platforms.length - 1];
    const furthestX = lastPlatform ? lastPlatform.x + lastPlatform.w : 0;

    const x = furthestX + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));
    const w = minimumWidth + Math.floor(Math.random() * (maximumWidth - minimumWidth));

    platforms.push(createPlatform(x, w));
}

function generateTree() {
    const minimumGap = 30;
    const maximumGap = 150;

    const lastTree = trees[trees.length - 1];
    const furthestX = lastTree ? lastTree.x : 0;

    const x = furthestX + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));
    const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
    const color = treeColors[Math.floor(Math.random() * 3)];

    trees.push({ x, color });
}

// 60-Second Challenge Timer Management
function updateTimerUI() {
    if (timerValElement) {
        const displaySec = Math.max(0, gameTimeRemaining);
        const prefix = displaySec < 10 ? "0" : "";
        timerValElement.innerText = `${prefix}${displaySec.toFixed(1)}s`;
    }
    if (timerBarElement) {
        const percent = Math.max(0, Math.min(100, (gameTimeRemaining / GAME_TIME_LIMIT) * 100));
        timerBarElement.style.width = `${percent}%`;
    }
    if (timerContainer) {
        timerContainer.classList.toggle("timer-warning", gameTimeRemaining <= 10.0);
    }
}

// Leaderboard Rendering
function renderLeaderboard(container, limit = 10) {
    if (!container) return;
    const list = getLeaderboard();
    const items = list.slice(0, limit);

    if (items.length === 0) {
        container.innerHTML = `<div class="lb-empty">SIN RÉCORDS REGISTRADOS</div>`;
        return;
    }

    let html = `
        <div class="lb-header-row">
            <span class="lb-col-rank">#</span>
            <span class="lb-col-name">JUGADOR</span>
            <span class="lb-col-pts">PTS</span>
            <span class="lb-col-time">TIEMPO</span>
        </div>
    `;

    items.forEach((item, idx) => {
        const isTop1 = idx === 0 ? " lb-top1" : "";
        html += `
            <div class="lb-row${isTop1}">
                <span class="lb-col-rank">${idx + 1}</span>
                <span class="lb-col-name">${item.name}</span>
                <span class="lb-col-pts">${item.score}</span>
                <span class="lb-col-time">${item.time || "--:--"}</span>
            </div>
        `;
    });

    container.innerHTML = html;
}

function resetGame() {
    phase = "waiting";
    lastTimestamp = undefined;
    sceneOffset = 0;
    score = 0;
    lastStretchTick = 0;
    lastStepX = 0;
    gameTimeRemaining = GAME_TIME_LIMIT;
    isTimerRunning = false;
    lastTimerWarningSec = -1;
    updateTimerUI();

    introductionElement.style.opacity = 1;
    perfectElement.style.opacity = 0;
    if (gameOverModal) gameOverModal.style.display = "none";
    scoreElement.innerText = score;
    if (highScoreElement) highScoreElement.innerText = `RÉCORD: ${highScore}`;

    platforms = [createPlatform(50, 50)];
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();

    sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];

    trees = [];
    for (let i = 0; i < 14; i++) {
        generateTree();
    }

    heroX = platforms[0].x + platforms[0].w - heroDistanceFromEdge;
    heroY = 0;
}

function gameOver(reason) {
    isTimerRunning = false;
    if (gameOverModal) {
        if (modalTitleElement) {
            modalTitleElement.innerText = reason === "timeout" ? "¡TIEMPO AGOTADO!" : "CAÍSTE AL VACÍO";
        }

        const usedTimeSeconds = Math.round(GAME_TIME_LIMIT - gameTimeRemaining);
        const timeStr = formatTime(usedTimeSeconds);

        if (modalScoreVal) modalScoreVal.innerText = score;
        if (modalTimeVal) modalTimeVal.innerText = timeStr;
        if (modalBestVal) modalBestVal.innerText = highScore;

        // Reset name entry box
        if (nameEntryBox) {
            const lastName = localStorage.getItem("stickHero_lastPlayerName") || "";
            nameEntryBox.innerHTML = `
                <label for="player-name-input" class="modal-sublabel">REGISTRA TU RÉCORD (60s):</label>
                <div class="input-row">
                    <input type="text" id="player-name-input" maxlength="10" placeholder="NOMBRE" value="${lastName}" class="pixel-input" autocomplete="off" spellcheck="false">
                    <button id="save-score-btn" type="button" class="pixel-save-btn">GUARDAR</button>
                </div>
            `;

            // Attach save handler
            const newSaveBtn = document.getElementById("save-score-btn");
            const newNameInput = document.getElementById("player-name-input");
            if (newSaveBtn && newNameInput) {
                newSaveBtn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    const name = newNameInput.value.trim() || "JUGADOR";
                    saveToLeaderboard(name, score, timeStr);
                    nameEntryBox.innerHTML = `<div class="saved-success-msg">✓ GUARDADO CON ÉXITO</div>`;
                    renderLeaderboard(leaderboardList, 5);
                });
            }
        }

        renderLeaderboard(leaderboardList, 5);
        gameOverModal.style.display = "flex";
    }
}

function getTargetPlatform() {
    const stickStartX = sticks.last().x;
    const currentIdx = platforms.findIndex((p) => Math.abs(p.x + p.w - stickStartX) < 3);
    return currentIdx !== -1 && currentIdx + 1 < platforms.length ? platforms[currentIdx + 1] : null;
}

function thePlatformTheStickHits() {
    if (sticks.last().rotation !== 90) {
        throw Error(`Stick is ${sticks.last().rotation}°`);
    }
    const stickFarX = sticks.last().x + sticks.last().length;
    const targetPlatform = getTargetPlatform();

    if (!targetPlatform) {
        return [undefined, false];
    }

    // Anti-Cheat: Must land strictly on the immediate next building
    if (targetPlatform.x <= stickFarX && stickFarX <= targetPlatform.x + targetPlatform.w) {
        const perfectStart = targetPlatform.x + targetPlatform.w / 2 - perfectAreaSize / 2;
        const perfectEnd = targetPlatform.x + targetPlatform.w / 2 + perfectAreaSize / 2;
        const isPerfect = perfectStart <= stickFarX && stickFarX <= perfectEnd;
        return [targetPlatform, isPerfect];
    }

    return [undefined, false];
}

// User Input Handling
window.addEventListener("keydown", function (event) {
    // If typing in the player name input, do not trigger game restart
    if (event.target && event.target.id === "player-name-input") {
        return;
    }

    if (event.key === " ") {
        event.preventDefault();
        ensureAudioStarted();
        playRestartSound();
        resetGame();
    }
});

function handlePointerDown(event) {
    if (
        event.target.closest("#theme-toggle") ||
        event.target.closest("#sound-toggle") ||
        event.target.closest("#leaderboard-btn") ||
        event.target.closest("#close-leaderboard-btn") ||
        event.target.closest("#restart") ||
        event.target.closest("#game-over-modal") ||
        event.target.closest("#leaderboard-modal")
    ) {
        return;
    }
    ensureAudioStarted();
    if (phase === "waiting") {
        introductionElement.style.opacity = 0;
        phase = "stretching";
        lastStretchTick = sticks.last().length;
        isTimerRunning = true; // Starts the 60-second challenge on first ladder stretch
    }
}

function handlePointerUp(event) {
    if (phase === "stretching") {
        phase = "turning";
    }
}

window.addEventListener("mousedown", handlePointerDown);
window.addEventListener("mouseup", handlePointerUp);

window.addEventListener("touchstart", handlePointerDown, { passive: true });
window.addEventListener("touchend", handlePointerUp);

if (restartButton) {
    restartButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        ensureAudioStarted();
        playRestartSound();
        resetGame();
    });
}

// Standalone Leaderboard Modal Listeners
if (leaderboardBtn) {
    leaderboardBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        renderLeaderboard(standaloneLeaderboardList, 10);
        if (leaderboardModal) leaderboardModal.style.display = "flex";
    });
}

if (closeLeaderboardBtn) {
    closeLeaderboardBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (leaderboardModal) leaderboardModal.style.display = "none";
    });
}

window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initSnow();
});

// Continuous Game Loop
window.requestAnimationFrame(animate);

function animate(timestamp) {
    if (!lastTimestamp) {
        lastTimestamp = timestamp;
    }
    const delta = Math.min(timestamp - lastTimestamp, 50);
    lastTimestamp = timestamp;

    if (isChristmasMode) {
        updateSnow(delta, timestamp);
    }
    updateSparkles(delta);

    // 60-Second Challenge Timer Countdown
    if (isTimerRunning && phase !== "ended") {
        gameTimeRemaining -= delta / 1000;
        updateTimerUI();

        // Audio warning when <= 5.0 seconds
        if (gameTimeRemaining <= 5.0 && gameTimeRemaining > 0) {
            const currentSec = Math.ceil(gameTimeRemaining);
            if (currentSec !== lastTimerWarningSec) {
                lastTimerWarningSec = currentSec;
                if (typeof playTimerTick === "function") playTimerTick();
            }
        }

        // 60 seconds finished -> Challenge over!
        if (gameTimeRemaining <= 0) {
            gameTimeRemaining = 0;
            isTimerRunning = false;
            updateTimerUI();
            phase = "ended";
            playRestartSound();
            gameOver("timeout");
        }
    }

    switch (phase) {
        case "waiting":
        case "ended":
            break;
        case "stretching": {
            sticks.last().length += delta / stretchingSpeed;
            playStretchSound(sticks.last().length);

            // Anti-Cheat: Max length cap forces auto-drop
            if (sticks.last().length >= maxLadderLength) {
                sticks.last().length = maxLadderLength;
                phase = "turning";
            }
            break;
        }
        case "turning": {
            sticks.last().rotation += delta / turningSpeed;

            if (sticks.last().rotation > 90) {
                sticks.last().rotation = 90;
                playLadderImpact();
                triggerScreenShake(2.5);

                const [nextPlatform, perfectHit] = thePlatformTheStickHits();
                if (nextPlatform) {
                    score += perfectHit ? 2 : 1;
                    scoreElement.innerText = score;

                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem("stickHero_highScore", highScore);
                        if (highScoreElement) highScoreElement.innerText = `RÉCORD: ${highScore}`;
                    }

                    if (perfectHit) {
                        playPerfectSound();
                        spawnSparkles(nextPlatform.x + nextPlatform.w / 2, canvasHeight - platformHeight - perfectAreaSize);
                        perfectElement.style.opacity = 1;
                        setTimeout(() => (perfectElement.style.opacity = 0), 1000);
                    } else {
                        playScoreSound();
                    }

                    generatePlatform();
                    generateTree();
                    generateTree();
                }

                phase = "walking";
                lastStepX = heroX;
            }
            break;
        }
        case "walking": {
            heroX += delta / walkingSpeed;
            playStepSound(heroX);

            const [nextPlatform] = thePlatformTheStickHits();
            if (nextPlatform) {
                const maxHeroX = nextPlatform.x + nextPlatform.w - heroDistanceFromEdge;
                if (heroX > maxHeroX) {
                    heroX = maxHeroX;
                    phase = "transitioning";
                }
            } else {
                const maxHeroX = sticks.last().x + sticks.last().length + heroWidth;
                if (heroX > maxHeroX) {
                    heroX = maxHeroX;
                    phase = "falling";
                    playFallSound();
                }
            }
            break;
        }
        case "transitioning": {
            sceneOffset += delta / transitioningSpeed;

            const [nextPlatform] = thePlatformTheStickHits();
            if (sceneOffset > nextPlatform.x + nextPlatform.w - paddingX) {
                sticks.push({
                    x: nextPlatform.x + nextPlatform.w,
                    length: 0,
                    rotation: 0
                });
                phase = "waiting";
            }
            break;
        }
        case "falling": {
            if (sticks.last().rotation < 180) {
                sticks.last().rotation += delta / turningSpeed;
            }

            const maxHeroY = platformHeight + 110;
            if (heroY < maxHeroY) {
                heroY += delta / fallingSpeed;
            } else {
                phase = "ended";
                gameOver("fall");
            }
            break;
        }
        default:
            throw Error("Wrong phase");
    }

    draw(timestamp);
    window.requestAnimationFrame(animate);
}

// Initial Setup
initStars();
initSnow();
resetGame();
