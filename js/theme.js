// Theme Module: Mode Switching & Styling Management
const snowflakeSvg = `<svg class="control-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="2" x2="12" y2="22"></line>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
    <line x1="19.07" y1="4.93" x2="4.93" y2="19.07"></line>
    <circle cx="12" cy="12" r="2.5" fill="currentColor"></circle>
</svg>`;

const classicSvg = `<svg class="control-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9"></circle>
    <path d="M12 3v18"></path>
    <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"></path>
</svg>`;

function applyTheme(christmas) {
    isChristmasMode = christmas;
    localStorage.setItem("stickHero_theme", christmas ? "christmas" : "classic");

    if (christmas) {
        document.body.classList.add("christmas-mode");
        if (themeIconContainer) themeIconContainer.innerHTML = snowflakeSvg;
        if (themeText) themeText.innerText = "MODO NAVIDEÑO";
        if (introductionElement) introductionElement.innerText = "MANTÉN PRESIONADO PARA ESTIRAR";
        if (perfectElement) perfectElement.innerText = "¡DOBLE PUNTUACIÓN!";
    } else {
        document.body.classList.remove("christmas-mode");
        if (themeIconContainer) themeIconContainer.innerHTML = classicSvg;
        if (themeText) themeText.innerText = "MODO CLÁSICO";
        if (introductionElement) introductionElement.innerText = "MANTÉN PRESIONADO PARA ESTIRAR";
        if (perfectElement) perfectElement.innerText = "¡DOBLE PUNTUACIÓN!";
    }

    if (!isMuted && audioInitialized) {
        startBGM();
    }
}

if (themeToggle) {
    themeToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        ensureAudioStarted();
        applyTheme(!isChristmasMode);
    });
}

applyTheme(isChristmasMode);

