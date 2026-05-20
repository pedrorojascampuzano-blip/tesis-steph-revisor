# Revisor interactivo · Tesis v4 · Steph

HTML self-contained para que Steph revise el resumen explicativo de la tesis v4 con edición tipo Google Docs, comentarios anclados, anotación con Apple Pencil y audio anclado por sección.

## Archivo principal

`revisor-tesis-v4.html` (87 KB, sin dependencias externas)

## Cómo abrir en iPad

1. Sube el archivo a iCloud Drive o Files de Steph (o mándalo por AirDrop, email, Drive link).
2. Steph lo abre con doble tap en Safari del iPad.
3. El archivo carga offline una vez en el navegador. Todo el estado se guarda en localStorage de Safari.
4. Cuando termine, toca **Exportar** en el toolbar y manda el JSON descargado de vuelta a Pedro.

## Cómo abrir en Mac

`open -a "Arc" revisor-tesis-v4.html` o doble click. Funciona igual en Chrome, Safari, Firefox.

## Modos de interacción

| Modo | Cómo activarlo | Qué hace |
|---|---|---|
| Edición en línea | Tap en el texto | Edita, borra, sustituye como Google Docs |
| Resaltar | Selecciona texto + tap en swatch amarillo/verde/rosa | Highlight en color |
| Comentario | Selecciona texto + botón "💬 Comentario" | Pregunta texto, ancla en sidebar |
| Lápiz | Botón "✏️ Lápiz" | Activa canvas overlay para Apple Pencil con presión |
| Audio | Cursor en una sección + botón "🎙 Audio" | Graba con micrófono, audio queda anclado a la sección |
| Deshacer | Botón "↶ Deshacer" | Restaura snapshot del último focus |

## Exportar e importar anotaciones

- **Exportar** descarga `anotaciones-tesis-v4-YYYY-MM-DD.json` con todos los comentarios, audios (base64), trazos de lápiz y HTML editado.
- **Importar** carga un JSON previamente descargado, útil para retomar en otra sesión o pasar el estado entre dispositivos.

## Estructura del documento

```
1. Mapa de la tesis (cards de los 5 capítulos con anchor scroll)
2. Introducción (planteamiento, preguntas, hipótesis, metodología, objetivos)
3. Capítulo I · Movilidad y control migratorio
4. Capítulo II · Estándar constitucional, interamericano e internacional
   · §2.5 Debida diligencia (NUEVA en v4)
   · §2.6 Buena administración pública (NUEVA en v4)
5. Capítulo III · Régimen jurídico interno
   · §3.6 Interacción con aerolíneas (NUEVA en v4)
6. Capítulo IV · Diagnóstico de brechas
7. Capítulo V · Propuesta: protocolo mínimo (PUGREMA)
8. Conclusiones
```

Cada capítulo tiene: argumento central, desarrollo, citas y fuentes clave, qué cambió vs v3.1, qué buscar al revisar.

## Limitaciones conocidas

- El audio se guarda como base64 dentro del JSON. Grabaciones largas pueden hacer el JSON pesado (1 minuto ~ 500 KB en base64).
- El JSON con todas las anotaciones puede crecer hasta varios MB si hay muchos audios. Para JSONs >10 MB usar Drive link en lugar de email.
- localStorage en Safari iPad tiene límite de ~10 MB por origen. Si se acerca, exportar y limpiar.
- Las ediciones del texto (insertar/borrar) NO marcan diff visual automático. Si quieres ver qué cambió, comparar el `docHTML` del JSON contra `revisor-tesis-v4.html` original.

## Fuentes

- Tesis completa: `../2026.05.19 - Tesis v4 - INTEGRADORA.md` (497 KB, 72,133 palabras)
- Tesis docx con TOC: `../2026.05.19 - Tesis v4.docx` (188 KB)
- Tesis HTML preview: `../2026.05.19 - Tesis v4.html` (590 KB con TOC y CSS)
- Briefing original: `../../fuentes/TESIS-PR-26.doc`
- CHANGELOG v3.1 → v4: ver README del proyecto en `../../README.md`
