# Backlog

Open change proposals. Move items to "Done" once implemented, tested and committed.
Effort: S = small (under 1 h), M = medium (a few hours), L = large (one or more sessions).

## Recommended order

1. ~~Phase 1 – Clean-up and foundation: #7, #3 (incl. #2), #5~~ (done)
2. ~~Phase 2 – Scenario management: #6, #12, #8, #1~~ (done)
3. ~~Phase 3 – Grid: #11, #10~~ (done)
4. Phase 4 – Sharing: #9

## Open

### 9. Shared "admin" scenario, read-only (M)
The info box gets a short text that the admin aims to visit all squares, plus a link to the
admin's scenario. The link opens the app in a new tab in read-only mode
(e.g. `index.html?view=shared`), which loads a JSON file stored in the repository.
No editing, no saving. Updated by downloading the scenario (#6), replacing the file and pushing.
Details tbd.

## Done

- Pin library versions in `index.html` (OpenLayers 10.11.0, proj4 2.22.0)
- #2 Escape and click on the dark background close every pop-up
- #3 Styles moved from ui.js to style.css; shared pop-up helper `openPopup()`
- #5 Delete pop-up shows "No scenario is active." right away
- #7 Debug messages removed from the console
- #1 Hint pop-up when squares are selected without an active scenario (once per page load);
  "Start new scenario" takes over an unsaved selection
- #6 Download scenario as JSON (`js/fileio.js`, format version 1 incl. square size)
- #8 Load pop-up with dropdown and "Upload from file", incl. name conflict handling
- #12 Rename the active scenario via pencil icon
- #11 Selectable square size (4, 5, 10, 20 km): chosen in "Start new scenario", stored per
  scenario (`gridSize`, missing = 4 km), slider in the menu without active scenario
- #10 Only squares that touch Switzerland are drawn and clickable: list generated from
  swissBOUNDARIES3D (`tools/build_swiss_squares.py` -> `js/swiss-squares.js`), border lakes
  incl. Lake Constance up to the border, Liechtenstein abroad; grid drawn as square outlines
