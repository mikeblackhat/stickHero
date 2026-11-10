// Audio Module: Web Audio API Sound Effects & Background Music
let isMuted = localStorage.getItem("stickHero_muted") === "true";
let audioCtx = null;
let audioInitialized = false;
let bgmTimeout = null;
let bgmNoteIndex = 0;

// Musical Note Frequencies (Hz)
const NOTES = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50,
    REST: 0
};

// Christmas BGM: 8-bit Chiptune "Jingle Bells"
const CHRISTMAS_BGM = [
    { note: "E4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "E4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "E4", dur: 440 }, { note: "REST", dur: 120 },

    { note: "E4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "E4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "E4", dur: 440 }, { note: "REST", dur: 120 },

    { note: "E4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "G4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "C4", dur: 320 }, { note: "REST", dur: 50 },
    { note: "D4", dur: 120 }, { note: "REST", dur: 50 },
    { note: "E4", dur: 650 }, { note: "REST", dur: 200 },

    { note: "F4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "F4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "F4", dur: 320 }, { note: "REST", dur: 50 },
    { note: "F4", dur: 120 }, { note: "REST", dur: 50 },
    { note: "F4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "E4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "E4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "E4", dur: 120 }, { note: "REST", dur: 50 },
    { note: "E4", dur: 120 }, { note: "REST", dur: 50 },
    { note: "E4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "D4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "D4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "E4", dur: 220 }, { note: "REST", dur: 50 },
    { note: "D4", dur: 440 }, { note: "REST", dur: 100 },
    { note: "G4", dur: 440 }, { note: "REST", dur: 300 }
];

// Classic BGM: 8-bit Retro Arcade Loop
const CLASSIC_BGM = [
    { note: "C4", dur: 160 }, { note: "REST", dur: 40 },
    { note: "E4", dur: 160 }, { note: "REST", dur: 40 },
    { note: "G4", dur: 160 }, { note: "REST", dur: 40 },
    { note: "B4", dur: 160 }, { note: "REST", dur: 40 },
    { note: "C5", dur: 320 }, { note: "REST", dur: 80 },
    { note: "G4", dur: 160 }, { note: "REST", dur: 40 },
    { note: "E4", dur: 220 }, { note: "REST", dur: 80 },
    { note: "A4", dur: 200 }, { note: "REST", dur: 50 },
    { note: "F4", dur: 200 }, { note: "REST", dur: 50 },
    { note: "D4", dur: 320 }, { note: "REST", dur: 160 }
];

function getAudioContext() {
    if (!audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            audioCtx = new AudioCtx();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

function ensureAudioStarted() {
    if (!audioInitialized) {
        audioInitialized = true;
        getAudioContext();
        if (!isMuted) {
            startBGM();
        }
    }
}

function playTone(freq, type, duration, volume = 0.12) {
    if (isMuted || freq <= 0) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {}
}

function playNextBGMNote() {
    if (bgmTimeout) clearTimeout(bgmTimeout);
    if (isMuted) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const playlist = isChristmasMode ? CHRISTMAS_BGM : CLASSIC_BGM;
    if (bgmNoteIndex >= playlist.length) {
        bgmNoteIndex = 0;
    }

    const { note, dur } = playlist[bgmNoteIndex];
    bgmNoteIndex++;

    if (note !== "REST" && NOTES[note]) {
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = isChristmasMode ? "triangle" : "square";
            osc.frequency.setValueAtTime(NOTES[note], ctx.currentTime);

            const vol = isChristmasMode ? 0.05 : 0.035;
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur / 1000);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + dur / 1000);
        } catch (e) {}
    }

    bgmTimeout = setTimeout(playNextBGMNote, dur);
}

function startBGM() {
    if (bgmTimeout) clearTimeout(bgmTimeout);
    bgmNoteIndex = 0;
    playNextBGMNote();
}

function stopBGM() {
    if (bgmTimeout) {
        clearTimeout(bgmTimeout);
        bgmTimeout = null;
    }
}

// Sound Effects
let lastStretchTick = 0;
function playStretchSound(length) {
    if (length - lastStretchTick > 14) {
        lastStretchTick = length;
        const freq = Math.min(320 + length * 3.5, 950);
        playTone(freq, "triangle", 0.035, 0.07);
    }
}

function playLadderImpact() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
}

let lastStepX = 0;
function playStepSound(x) {
    if (Math.abs(x - lastStepX) > 16) {
        lastStepX = x;
        playTone(220, "sine", 0.03, 0.04);
    }
}

function playScoreSound() {
    playTone(523.25, "triangle", 0.1, 0.12); // C5
    setTimeout(() => playTone(659.25, "triangle", 0.15, 0.12), 80); // E5
}

function playPerfectSound() {
    const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6
    notes.forEach((freq, idx) => {
        setTimeout(() => playTone(freq, "sine", 0.25, 0.15), idx * 70);
    });
}

function playFallSound() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.55);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
    } catch (e) {}
}

function playRestartSound() {
    playTone(392.00, "square", 0.08, 0.08); // G4
    setTimeout(() => playTone(523.25, "square", 0.12, 0.08), 80); // C5
}

function updateSoundUI() {
    if (soundOnSvg && soundOffSvg) {
        soundOnSvg.style.display = isMuted ? "none" : "block";
        soundOffSvg.style.display = isMuted ? "block" : "none";
    }
}

if (soundToggle) {
    soundToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        isMuted = !isMuted;
        localStorage.setItem("stickHero_muted", isMuted);
        updateSoundUI();
        if (isMuted) {
            stopBGM();
        } else {
            ensureAudioStarted();
            startBGM();
        }
    });
}

updateSoundUI();

