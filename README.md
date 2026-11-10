# Stick Hero - Edición Navideña & Arcade

Un juego web interactivo desarrollado en JavaScript vanilla y HTML5 Canvas, inspirado en el clásico Stick Hero, con temática navideña, estética pixel art, físicas mejoradas y música retro en 8-bits.

## Características

- **Modo Navideño (por defecto):**
  - Personaje animado de Santa Claus con movimiento de pasos y balanceo de marcha.
  - Escalera de madera extensible en lugar del stick clásico.
  - Edificios con techos cubiertos de nieve, ventanas iluminadas y chimeneas con humo animado.
  - Zona de puntuación perfecta con regalos navideños.
  - Ambiente invernal: cielo nocturno con gradiente, luna brillante, estrellas titilantes, colinas nevadas, pinos decorados y caída continua de nieve.
- **Modo Clásico:**
  - Alterna al estilo minimalista original con un solo clic.
- **Audio y Efectos con Web Audio API:**
  - Melodías en 8-bits (BGM): *Jingle Bells* para el modo navideño y melodía arcade para el modo clásico.
  - Efectos de sonido (SFX): extensión de escalera, impacto con vibración en pantalla (*screen shake*), pasos, puntos, cascabeles en puntuación doble y caída al vacío.
  - Control de volumen para silenciar/activar el sonido con memoria local (`localStorage`).
- **Diseño Pixel Art:**
  - Tipografía retro arcade usando la fuente *Press Start 2P*.
  - Iconos vectoriales SVG limpios.
  - Marcador de puntuación actual y récord histórico guardado en el navegador.
  - Tarjeta modal de fin de partida (Game Over).
- **Sistema Anti-Trampas:**
  - Límite máximo de longitud de escalera con caída forzada si se intenta estirar infinitamente.
  - Restricción estricta de objetivo: la escalera solo es válida si aterriza exactamente en el edificio inmediato siguiente, evitando saltarse edificios.
  - Indicador visual de sobretensión en la escalera.
- **Arquitectura Modular:**
  - Código desacoplado en módulos dentro de `js/` (`config.js`, `audio.js`, `theme.js`, `renderer.js`, `game.js`).

## Cómo ejecutar localmente

Simplemente abre el archivo `index.html` en cualquier navegador web moderno, o ejecuta un servidor local:

```bash
python3 -m http.server 8000
```

Y visita `http://localhost:8000`.

## Controles

- **Mantener presionado (Click / Tap / Espacio):** Estirar la escalera.
- **Soltar:** La escalera cae y Santa cruza al siguiente edificio.
- **Barra espaciadora o botón Reintentar:** Reiniciar tras caer.

