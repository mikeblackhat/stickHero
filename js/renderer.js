// Renderer Module: Canvas Drawing & Visual Effects
const stars = [];
const snowflakes = [];
const sparkles = [];
let screenShake = 0;

function triggerScreenShake(amount = 3) {
    screenShake = amount;
}

function spawnSparkles(x, y) {
    for (let i = 0; i < 24; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1;
        sparkles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.2,
            size: Math.random() * 3.5 + 2,
            color: ["#ffd700", "#ff5252", "#ffffff", "#00e5ff", "#ffeb3b"][Math.floor(Math.random() * 5)],
            alpha: 1,
            decay: Math.random() * 0.025 + 0.02
        });
    }
}

function updateSparkles(delta) {
    const factor = delta / 16;
    for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.vx * factor;
        s.y += s.vy * factor;
        s.vy += 0.08 * factor; // gravity
        s.alpha -= s.decay * factor;
        if (s.alpha <= 0) {
            sparkles.splice(i, 1);
        }
    }
}

function drawSparkles() {
    ctx.save();
    sparkles.forEach((s) => {
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

function initStars() {
    stars.length = 0;
    const starCount = 70;
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random(),
            y: Math.random() * 0.65,
            size: Math.random() * 1.8 + 0.6,
            twinkleSpeed: Math.random() * 0.003 + 0.001,
            twinklePhase: Math.random() * Math.PI * 2
        });
    }
}

function initSnow() {
    snowflakes.length = 0;
    const count = 95;
    for (let i = 0; i < count; i++) {
        snowflakes.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 2.6 + 1.2,
            speedY: Math.random() * 0.85 + 0.65,
            speedX: (Math.random() - 0.5) * 0.45,
            swingSpeed: Math.random() * 0.002 + 0.001
        });
    }
}

function updateSnow(delta, timestamp) {
    const factor = delta / 16;
    snowflakes.forEach((flake) => {
        flake.y += flake.speedY * factor;
        flake.x += (flake.speedX + Math.sin(timestamp * flake.swingSpeed) * 0.45) * factor;

        if (flake.y > window.innerHeight) {
            flake.y = -6;
            flake.x = Math.random() * window.innerWidth;
        }
        if (flake.x > window.innerWidth) flake.x = 0;
        if (flake.x < 0) flake.x = window.innerWidth;
    });
}

function drawStars(timestamp) {
    ctx.save();
    stars.forEach((star) => {
        const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase));
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x * window.innerWidth, star.y * window.innerHeight, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

function drawMoon() {
    const moonX = window.innerWidth * 0.8;
    const moonY = 90;
    const moonRadius = 30;

    ctx.save();
    const glow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.4, moonX, moonY, moonRadius * 2.8);
    glow.addColorStop(0, "rgba(255, 253, 231, 0.4)");
    glow.addColorStop(0.5, "rgba(255, 253, 231, 0.12)");
    glow.addColorStop(1, "rgba(255, 253, 231, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fffde7";
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(225, 218, 185, 0.35)";
    ctx.beginPath();
    ctx.arc(moonX - 8, moonY - 6, 5, 0, Math.PI * 2);
    ctx.arc(moonX + 9, moonY + 7, 6.5, 0, Math.PI * 2);
    ctx.arc(moonX - 2, moonY + 12, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawSnow() {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.beginPath();
    snowflakes.forEach((flake) => {
        ctx.moveTo(flake.x + flake.r, flake.y);
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
    });
    ctx.fill();
    ctx.restore();
}

function drawHill(baseHeight, amplitude, stretch, color) {
    ctx.beginPath();
    ctx.moveTo(0, window.innerHeight);
    ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
    for (let i = 0; i < window.innerWidth; i += 2) {
        ctx.lineTo(i, getHillY(i, baseHeight, amplitude, stretch));
    }
    ctx.lineTo(window.innerWidth, window.innerHeight);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawTree(x, color) {
    ctx.save();
    ctx.translate(
        (-sceneOffset * backgroundSpeedMultiplier + x) * hill1Stretch,
        getTreeY(x, hill1BaseHeight, hill1Amplitude)
    );

    if (isChristmasMode) {
        const trunkW = 3.5;
        const trunkH = 7;
        ctx.fillStyle = "#3e2723";
        ctx.fillRect(-trunkW / 2, -trunkH, trunkW, trunkH);

        const tiers = [
            { y: -trunkH, w: 18, h: 10 },
            { y: -trunkH - 7, w: 14, h: 9 },
            { y: -trunkH - 14, w: 9, h: 8 }
        ];

        tiers.forEach((tier, i) => {
            ctx.beginPath();
            ctx.moveTo(-tier.w / 2, tier.y);
            ctx.lineTo(0, tier.y - tier.h);
            ctx.lineTo(tier.w / 2, tier.y);
            ctx.closePath();
            ctx.fillStyle = "#1b4332";
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(-tier.w / 2, tier.y);
            ctx.lineTo(-tier.w / 2 + 3, tier.y - 2);
            ctx.lineTo(0, tier.y - 1);
            ctx.lineTo(tier.w / 2 - 3, tier.y - 2);
            ctx.lineTo(tier.w / 2, tier.y);
            ctx.closePath();
            ctx.fill();

            const ornamentColors = ["#e53935", "#ffd700", "#00e5ff"];
            ctx.fillStyle = ornamentColors[i % ornamentColors.length];
            ctx.beginPath();
            ctx.arc((i % 2 === 0 ? -1 : 1) * (tier.w / 3.8), tier.y - 2, 1.3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(0, -trunkH - 22, 2.3, 0, Math.PI * 2);
        ctx.fill();
    } else {
        const treeTrunkHeight = 5;
        const treeTrunkWidth = 2;
        const treeCrownHeight = 25;
        const treeCrownWidth = 10;

        ctx.fillStyle = "#7D833C";
        ctx.fillRect(-treeTrunkWidth / 2, -treeTrunkHeight, treeTrunkWidth, treeTrunkHeight);

        ctx.beginPath();
        ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
        ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
        ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
        ctx.fillStyle = color;
        ctx.fill();
    }

    ctx.restore();
}

function drawBackground(timestamp) {
    if (isChristmasMode) {
        const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
        gradient.addColorStop(0, "#080e1e");
        gradient.addColorStop(0.5, "#0f1c3f");
        gradient.addColorStop(1, "#182c59");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        drawStars(timestamp);
        drawMoon();

        drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#30435f");
        drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#566f8e");

        trees.forEach((tree) => drawTree(tree.x, tree.color));
    } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
        gradient.addColorStop(0, "#BBD691");
        gradient.addColorStop(1, "#FEF1E1");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#95C629");
        drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#659F1C");

        trees.forEach((tree) => drawTree(tree.x, tree.color));
    }
}

function drawPlatforms(timestamp) {
    const targetPlatform = typeof getTargetPlatform === "function" ? getTargetPlatform() : null;

    platforms.forEach((platform) => {
        const { x, w } = platform;
        const topY = canvasHeight - platformHeight;
        const height = platformHeight + 450;
        const isTarget = targetPlatform && targetPlatform.x === x;

        if (isChristmasMode) {
            ctx.fillStyle = platform.buildingColor || "#1e293b";
            ctx.fillRect(x, topY, w, height);

            const cols = platform.windowCols || Math.max(1, Math.floor((w - 10) / 14));
            const startX = x + (w - cols * 13 + 3) / 2;
            const rows = 6;

            for (let r = 0; r < rows; r++) {
                const winY = topY + 14 + r * 16;
                if (winY + 10 > topY + height) break;

                for (let c = 0; c < cols; c++) {
                    const winX = startX + c * 13;
                    const idx = r * cols + c;
                    const isLit = platform.windowLights ? platform.windowLights[idx % platform.windowLights.length] : true;

                    ctx.fillStyle = isLit ? "#ffe082" : "#263238";
                    ctx.fillRect(winX, winY, 8, 10);

                    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(winX, winY, 8, 10);
                }
            }

            if (platform.hasChimney) {
                const chimX = x + platform.chimneyOffset;
                const chimW = 9;
                const chimH = 13;
                const chimY = topY - chimH;

                ctx.fillStyle = "#8d2b2b";
                ctx.fillRect(chimX, chimY, chimW, chimH);

                ctx.fillStyle = "#a83232";
                ctx.fillRect(chimX - 1, chimY, chimW + 2, 3);

                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(chimX + chimW / 2, chimY, 3, 0, Math.PI * 2);
                ctx.fill();

                const time = timestamp || 0;
                for (let p = 0; p < 2; p++) {
                    const progress = ((time / 900 + p * 0.5) % 1);
                    const puffY = chimY - progress * 18;
                    const puffX = chimX + chimW / 2 + Math.sin(progress * Math.PI * 2) * 3 - progress * 4;
                    const puffRadius = 2 + progress * 4;
                    const alpha = (1 - progress) * 0.4;
                    ctx.fillStyle = `rgba(220, 225, 230, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(puffX, puffY, puffRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            drawRoofSnow(x, topY, w);

            // Target building shows the Christmas gift box target
            if (isTarget) {
                drawChristmasPresent(x + w / 2, topY);
            }
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(x, topY, w, height);

            if (isTarget) {
                ctx.fillStyle = "red";
                ctx.fillRect(x + w / 2 - perfectAreaSize / 2, topY, perfectAreaSize, perfectAreaSize);
            }
        }
    });
}

function drawRoofSnow(x, topY, w) {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x - 2, topY);
    ctx.lineTo(x + w + 2, topY);
    ctx.lineTo(x + w + 2, topY + 4);

    const scallopSize = 8;
    const count = Math.max(2, Math.floor((w + 4) / scallopSize));
    const step = (w + 4) / count;
    for (let i = count; i >= 0; i--) {
        const cx = x - 2 + i * step;
        ctx.lineTo(cx, topY + (i % 2 === 0 ? 5.5 : 3.5));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawChristmasPresent(centerX, topY) {
    const size = perfectAreaSize;
    const x = centerX - size / 2;
    const y = topY - size;

    ctx.save();
    ctx.fillStyle = "#e53935";
    ctx.fillRect(x, y, size, size);

    ctx.fillStyle = "#ffd700";
    ctx.fillRect(x + size / 2 - 1, y, 2, size);
    ctx.fillRect(x, y + size / 2 - 1, size, 2);

    ctx.beginPath();
    ctx.arc(centerX - 2, y - 1, 2, 0, Math.PI * 2);
    ctx.arc(centerX + 2, y - 1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawHero() {
    ctx.save();

    // Walking bounce animation
    const isWalking = phase === "walking";
    const walkBounce = isWalking ? -Math.abs(Math.sin(heroX * 0.3)) * 2 : 0;

    ctx.translate(
        heroX - heroWidth / 2,
        heroY + canvasHeight - platformHeight - heroHeight / 2 + walkBounce
    );

    if (isChristmasMode) {
        drawSanta(isWalking);
    } else {
        drawClassicHero(isWalking);
    }

    ctx.restore();
}

function drawSanta(isWalking) {
    ctx.save();

    // Santa's Toy Sack on his back
    ctx.fillStyle = "#8d6e63";
    ctx.beginPath();
    ctx.arc(-7, 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(-10, -3, 3, 2);

    // Legs animation
    const legOffset = isWalking ? Math.sin(heroX * 0.3) * 3 : 0;

    // Boots (black)
    ctx.fillStyle = "#212121";
    ctx.beginPath();
    ctx.arc(-4 + legOffset, 12, 3.2, 0, Math.PI * 2);
    ctx.arc(4 - legOffset, 12, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // White fur boot cuffs
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-7 + legOffset, 8.5, 6, 2.5);
    ctx.fillRect(1 - legOffset, 8.5, 6, 2.5);

    // Red Santa Coat
    ctx.fillStyle = "#d32f2f";
    drawRoundedRect(-8, -5, 16, 14, 4);

    // Black Belt
    ctx.fillStyle = "#1b1b1b";
    ctx.fillRect(-8.5, 1, 17, 3.5);

    // Gold Belt Buckle
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(-3, 0.5, 6, 4.5);
    ctx.fillStyle = "#1b1b1b";
    ctx.fillRect(-1.5, 1.5, 3, 2.5);

    // White Fur Trim at coat bottom
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-8.5, 7, 17, 2.5);

    // Face (peach tone)
    ctx.fillStyle = "#ffccbc";
    ctx.beginPath();
    ctx.arc(2, -7, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Rosy pink cheek
    ctx.fillStyle = "rgba(255, 138, 128, 0.7)";
    ctx.beginPath();
    ctx.arc(5, -6, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = "#212121";
    ctx.beginPath();
    ctx.arc(4.5, -8.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy White Beard & Moustache
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(1, -3.5, 5, 0, Math.PI * 2);
    ctx.arc(5, -4, 3.5, 0, Math.PI * 2);
    ctx.arc(-2, -4, 4, 0, Math.PI * 2);
    ctx.arc(3, -1, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Santa Hat White Fur Band
    ctx.fillStyle = "#ffffff";
    drawRoundedRect(-8, -12.5, 16, 3.5, 1.5);

    // Red Santa Cap
    ctx.fillStyle = "#d32f2f";
    ctx.beginPath();
    ctx.moveTo(-6, -12);
    ctx.lineTo(6, -12);
    ctx.lineTo(-8, -18);
    ctx.closePath();
    ctx.fill();

    // White Fluffy Pom-pom
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-9, -17.5, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawClassicHero(isWalking) {
    ctx.fillStyle = "black";

    drawRoundedRect(-heroWidth / 2, -heroHeight / 2, heroWidth, heroHeight - 4, 5);

    const legOffset = isWalking ? Math.sin(heroX * 0.3) * 3 : 0;
    const legDistance = 5;

    ctx.beginPath();
    ctx.arc(legDistance - legOffset, 11.5, 3, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-legDistance + legOffset, 11.5, 3, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(5, -7, 3, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = "red";
    ctx.fillRect(-heroWidth / 2 - 1, -12, heroWidth + 2, 4.5);
    ctx.beginPath();
    ctx.moveTo(-9, -14.5);
    ctx.lineTo(-17, -18.5);
    ctx.lineTo(-14, -8.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -10.5);
    ctx.lineTo(-15, -3.5);
    ctx.lineTo(-5, -7);
    ctx.fill();
}

function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.fill();
}

function drawSticks() {
    sticks.forEach((stick) => {
        ctx.save();
        ctx.translate(stick.x, canvasHeight - platformHeight);
        ctx.rotate((Math.PI / 180) * stick.rotation);

        if (isChristmasMode) {
            const ladderWidth = 7;
            const halfW = ladderWidth / 2;
            const length = stick.length;

            if (length > 0) {
                const isNearLimit = length > 250;
                ctx.strokeStyle = isNearLimit && (Math.floor(Date.now() / 120) % 2 === 0) ? "#e53935" : "#8d5524";
                ctx.lineWidth = 2.2;
                ctx.lineCap = "round";

                ctx.beginPath();
                ctx.moveTo(-halfW, 0);
                ctx.lineTo(-halfW, -length);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(halfW, 0);
                ctx.lineTo(halfW, -length);
                ctx.stroke();

                const rungSpacing = 8;
                ctx.strokeStyle = isNearLimit && (Math.floor(Date.now() / 120) % 2 === 0) ? "#ef5350" : "#d49b5c";
                ctx.lineWidth = 1.8;
                for (let r = 4; r < length; r += rungSpacing) {
                    ctx.beginPath();
                    ctx.moveTo(-halfW, -r);
                    ctx.lineTo(halfW, -r);
                    ctx.stroke();
                }
            }
        } else {
            const isNearLimit = stick.length > 250;
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = isNearLimit && (Math.floor(Date.now() / 120) % 2 === 0) ? "#e53935" : "black";
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -stick.length);
            ctx.stroke();
        }

        ctx.restore();
    });
}

function draw(timestamp) {
    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Apply micro screen shake if active
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    if (screenShake > 0) {
        shakeOffsetX = (Math.random() - 0.5) * screenShake;
        shakeOffsetY = (Math.random() - 0.5) * screenShake;
        screenShake = Math.max(0, screenShake - 0.4);
    }
    ctx.translate(shakeOffsetX, shakeOffsetY);

    drawBackground(timestamp);

    const gameScale = getGameScale();

    ctx.save();
    ctx.translate(
        window.innerWidth / 2 - (canvasWidth / 2 + sceneOffset) * gameScale,
        window.innerHeight / 2 - (canvasHeight / 2) * gameScale
    );
    ctx.scale(gameScale, gameScale);

    drawPlatforms(timestamp);
    drawHero();
    drawSticks();
    drawSparkles();

    ctx.restore();
    ctx.restore();

    if (isChristmasMode) {
        drawSnow();
    }
}

function getHillY(windowX, baseHeight, amplitude, stretch) {
    const sineBaseY = window.innerHeight - baseHeight;
    return (
        Math.sinus((sceneOffset * backgroundSpeedMultiplier + windowX) * stretch) *
        amplitude +
        sineBaseY
    );
}

function getTreeY(x, baseHeight, amplitude) {
    const sineBaseY = window.innerHeight - baseHeight;
    return Math.sinus(x) * amplitude + sineBaseY;
}

