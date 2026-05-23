# Tesis Coach

App tipo Duolingo para terminar la tesis de Steph (v4).

## Vivo en

https://pedrorojascampuzano-blip.github.io/tesis-steph-revisor/coach/

Subdirectorio del repo del revisor. Comparte deploy.

## Qué hace

- Steph define deadline, horas/día, días activos y estimación por milestone.
- Simulador en vivo muestra si alcanza, sobra o falta tiempo.
- 3 sliders interactivos (deadline, horas/día, días activos) que recalculan en tiempo real.
- Daily mode: una tarea atómica por sesión, timer, marca completé o no alcancé.
- Streak diario, XP en minutos, progreso real por milestone, badges al cerrar milestone.
- Export / import JSON para respaldo.

## Stack

- HTML, CSS, JS vanilla, ES6 modules.
- Sin frameworks, sin backend, sin build step.
- localStorage para persistencia (clave `tesis-coach-state-v1`).
- Mobile-first, target iPad.

## Archivos

- `index.html` UI + glue.
- `simulator.js` lógica pura de tiempo (verdict, ajustes, daily target).
- `daily.js` estado, persistencia, streak, sesiones.
- `roadmap.json` los 9 milestones reales del README v4.
- `styles.css` mobile-first, paleta heredada del revisor.

## Roadmap

9 milestones extraídos de `~/Projects/personal/steph-tesis/README.md` sección "Próximos pasos". 52 horas estimadas, 77 atomic slices. Cada slice es una sesión de 25-45 min.
