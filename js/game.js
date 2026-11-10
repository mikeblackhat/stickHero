// Game Module: Mechanics, Physics, Game Loop & Input Handling

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

function resetGame() {
    phase = "waiting";
    lastTimestamp = undefined;
    sceneOffset = 0;
    score = 0;
    lastStretchTick = 0;
    lastStepX = 0;

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

function gameOver() {
    if (gameOverModal) {
        if (modalScoreVal) modalScoreVal.innerText = score;
        if (modalBestVal) modalBestVal.innerText = highScore;
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

    // Anti-Cheat Rule: Must land strictly on the immediate next building
    // Overshooting or landing on a further building in the background is treated as a miss
    if (targetPlatform.x <= stickFarX && stickFarX <= targetPlatform.x + targetPlatform.w) {
        const perfectStart = targetPlatform.x + targetPlatform.w / 2 - perfectAreaSize / 2;
        const perfectEnd = targetPlatform.x + targetPlatform.w / 2 + perfectAreaSize / 2;
        const isPerfect = perfectStart <= stickFarX && stickFarX <= perfectEnd;
        return [targetPlatform, isPerfect];
    }

    // Missed the intended building (too short or overshot)
    return [undefined, false];
}

// User Input Handling
window.addEventListener("keydown", function (event) {
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
        event.target.closest("#restart") ||
        event.target.closest("#game-over-modal")
    ) {
        return;
    }
    ensureAudioStarted();
    if (phase === "waiting") {
        introductionElement.style.opacity = 0;
        phase = "stretching";
        lastStretchTick = sticks.last().length;
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

    switch (phase) {
        case "waiting":
            break;
        case "stretching": {
            sticks.last().length += delta / stretchingSpeed;
            playStretchSound(sticks.last().length);

            // Anti-Cheat Rule: Cannot stretch past max length. Forces drop if limit reached.
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
                gameOver();
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

