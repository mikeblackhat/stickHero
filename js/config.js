// Extend JavaScript Prototypes
Array.prototype.last = function () {
    return this[this.length - 1];
};

Math.sinus = function (degree) {
    return Math.sin((degree / 180) * Math.PI);
};

// Configuration Constants
const canvasWidth = 375;
const canvasHeight = 375;
const platformHeight = 100;
const heroDistanceFromEdge = 10;
const paddingX = 100;
const perfectAreaSize = 10;

const backgroundSpeedMultiplier = 0.2;

const hill1BaseHeight = 100;
const hill1Amplitude = 10;
const hill1Stretch = 1;
const hill2BaseHeight = 70;
const hill2Amplitude = 20;
const hill2Stretch = 0.5;

const stretchingSpeed = 4;
const turningSpeed = 4;
const walkingSpeed = 4;
const transitioningSpeed = 2;
const fallingSpeed = 2;

const heroWidth = 17;
const heroHeight = 30;

// Anti-Cheat & 60s Challenge Configuration
const maxLadderLength = 310;
const GAME_TIME_LIMIT = 60.0; // 60-second total challenge
let gameTimeRemaining = GAME_TIME_LIMIT;
let isTimerRunning = false;
let lastTimerWarningSec = -1;

// Game State Variables
let phase = "waiting"; // waiting | stretching | turning | walking | transitioning | falling
let lastTimestamp;

let heroX;
let heroY;
let sceneOffset;

let platforms = [];
let sticks = [];
let trees = [];

let score = 0;
let highScore = parseInt(localStorage.getItem("stickHero_highScore") || "0", 10);

// Theme State
const savedTheme = localStorage.getItem("stickHero_theme");
let isChristmasMode = savedTheme !== null ? savedTheme === "christmas" : true;

// Canvas & 2D Context Setup
const canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

// DOM Elements
const introductionElement = document.getElementById("introduction");
const perfectElement = document.getElementById("perfect");
const restartButton = document.getElementById("restart");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");

// Timer Elements
const timerContainer = document.getElementById("timer-container");
const timerValElement = document.getElementById("timer-val");
const timerBarElement = document.getElementById("timer-bar");

// Modal Elements
const gameOverModal = document.getElementById("game-over-modal");
const modalTitleElement = document.getElementById("modal-title");
const modalScoreVal = document.getElementById("modal-score-val");
const modalTimeVal = document.getElementById("modal-time-val");
const modalBestVal = document.getElementById("modal-best-val");
const playerNameInput = document.getElementById("player-name-input");
const saveScoreBtn = document.getElementById("save-score-btn");
const nameEntryBox = document.getElementById("name-entry-box");
const leaderboardList = document.getElementById("leaderboard-list");

// Standalone Leaderboard Modal
const leaderboardBtn = document.getElementById("leaderboard-btn");
const leaderboardModal = document.getElementById("leaderboard-modal");
const closeLeaderboardBtn = document.getElementById("close-leaderboard-btn");
const standaloneLeaderboardList = document.getElementById("standalone-leaderboard-list");

// Controls
const themeToggle = document.getElementById("theme-toggle");
const themeIconContainer = document.getElementById("theme-icon-container");
const themeText = document.getElementById("theme-text");
const soundToggle = document.getElementById("sound-toggle");
const soundOnSvg = document.getElementById("sound-on-svg");
const soundOffSvg = document.getElementById("sound-off-svg");

// Dynamic Scale Helper
function getGameScale() {
    const scaleByHeight = window.innerHeight / 480;
    return Math.min(Math.max(scaleByHeight, 1.45), 2.1);
}

// Time Formatter (seconds -> MM:SS)
function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const mStr = mins < 10 ? `0${mins}` : `${mins}`;
    const sStr = secs < 10 ? `0${secs}` : `${secs}`;
    return `${mStr}:${sStr}`;
}

// Leaderboard Storage Helpers
function getLeaderboard() {
    try {
        const data = localStorage.getItem("stickHero_leaderboard");
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveToLeaderboard(name, finalScore, timeStr) {
    const cleanName = (name || "JUGADOR").trim().toUpperCase().slice(0, 10);
    const list = getLeaderboard();
    const date = new Date().toLocaleDateString(undefined, { month: "numeric", day: "numeric" });

    list.push({
        name: cleanName,
        score: finalScore,
        time: timeStr,
        date: date
    });

    // Sort descending by score, secondary by time
    list.sort((a, b) => b.score - a.score);

    // Keep top 10
    const trimmed = list.slice(0, 10);
    localStorage.setItem("stickHero_leaderboard", JSON.stringify(trimmed));
    localStorage.setItem("stickHero_lastPlayerName", cleanName);
    return trimmed;
}
