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

// Anti-Cheat Rules Configuration
const maxLadderLength = 310; // Maximum allowed ladder extension before forced drop

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
const gameOverModal = document.getElementById("game-over-modal");
const modalScoreVal = document.getElementById("modal-score-val");
const modalBestVal = document.getElementById("modal-best-val");
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

