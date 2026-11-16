# Backlog

Open change proposals. Move items to "Done" once implemented, tested and committed.
Effort: S = small (under 1 h), M = medium (a few hours), L = large (one or more sessions).

## Recommended order

1. ~~Phase 1 – Clean-up and foundation: #7, #3 (incl. #2), #5~~ (done)
2. Phase 2 – Scenario management: #6, #12, #8, #1
3. Phase 3 – Grid: #10, #11
4. Phase 4 – Sharing: #9

## Open

### 1. Hint when selecting squares without an active scenario (S)
When a square is clicked and no scenario is active, show a pop-up such as:
"No active scenario. Your selection will not be saved. To save it, click 'Start new scenario'
(or download it as a file)."
Proposal: show it only once per session, not on every click.

### 6. Download scenario as a file (S–M)
Menu button "Download scenario" opens a pop-up explaining what it does, with "Download" and "Cancel".
- Downloads the active scenario as JSON into the browser's download folder.
- Without an active scenario, the current selection is downloaded as
  `unnamed-scenario-<date>.json`.
- File contains a format version, name, square size (4 km for now) and the squares, so it
  stays compatible once #11 exists.

### 8. Rework the "Load existing scenario" pop-up incl. upload (M)
Show the scenarios saved in the browser as a dropdown list instead of one button per scenario.
Below it, a button "Upload from file" loads a scenario from a downloaded JSON file.
The uploaded scenario is saved in the browser and becomes active.
Name conflict: no two scenarios may have the same name. A pop-up explains the conflict and
offers a field to enter a different name for the uploaded scenario (decided).

### 9. Shared "admin" scenario, read-only (M)
The info box gets a short text that the admin aims to visit all squares, plus a link to the
admin's scenario. The link opens the app in a new tab in read-only mode
(e.g. `index.html?view=shared`), which loads a JSON file stored in the repository.
No editing, no saving. Updated by downloading the scenario (#6), replacing the file and pushing.
Details tbd.

### 10. Show only squares that touch Switzerland (M–L)
Only squares that cover at least part of Switzerland are drawn and clickable
(99 % abroad stays, 100 % abroad is removed).
- Border: Swiss national territory from swisstopo (swissBOUNDARIES3D), stored once as a
  simplified file in the repository.
- Liechtenstein counts as abroad. Lake Constance stays outside.
- Already colored squares outside Switzerland are removed when loading (does not occur in practice).
- The grid is then drawn as square outlines instead of continuous lines.

### 11. Selectable square size (M–L)
Square sizes 4, 5, 10 and 20 km, all starting from the same origin (2600000 / 1200000).
- Size is chosen in the "Start new scenario" pop-up and stays fixed for the scenario.
- Without an active scenario, a slider in the menu allows switching; the current selection is lost.
- Stored per scenario; existing scenarios without a size count as 4 km (no migration needed).

### 12. Rename scenarios (S–M)
Currently scenarios cannot be renamed. Proposal: pencil icon next to "Active scenario: <name>"
in the menu, opening a pop-up with the name field (same rules as "Start new scenario").

## Done

- Pin library versions in `index.html` (OpenLayers 10.11.0, proj4 2.22.0)
- #2 Escape and click on the dark background close every pop-up
- #3 Styles moved from ui.js to style.css; shared pop-up helper `openPopup()`
- #5 Delete pop-up shows "No scenario is active." right away
- #7 Debug messages removed from the console
