# Backlog

Open change proposals. Move items to "Done" once implemented, tested and committed.

## Open

### 1. Hint when selecting squares without an active scenario
When a square is clicked and no scenario is active, show a pop-up such as:
"No active scenario. Your selection will not be saved. To save it, click 'Start new scenario'."
Open question: show it on every click or only once per session?

### 2. Close all pop-ups reliably with Escape
The Escape listener currently sits on the overlay and only fires if the focus is inside the pop-up.
This works for "Start new scenario" (focus is in the text field), but not for "Load" and "Delete".
Fix: one shared listener on `document` while a pop-up is open, removed again on close.
Optional: close the pop-up by clicking the dark background.

### 3. Move inline styles from ui.js to style.css
Replace the `element.style.xyz = ...` lines with CSS classes (e.g. `.menu`, `.menu-button`,
`.popup-overlay`, `.popup-box`, `.error-msg`, `.color-circle`, `.color-circle.active`).
Also add a shared helper that builds a pop-up, instead of repeating the same code three times.
The look stays the same.

### 5. Delete pop-up without an active scenario
"Delete active scenario" opens the confirmation even when no scenario is active.
Show the message "No scenario is active." right away instead.

### 6. Export / import scenarios as a file
Save a scenario's data as a file and upload it again. Details to follow.
Must read the existing localStorage format, so current scenarios can be exported.

## Done

- Pin library versions in `index.html` (OpenLayers 10.11.0, proj4 2.22.0)
