# Swiss Grid App

An interactive map of Switzerland with a grid of 4 × 4 km squares. Click squares to color them and save your selections as named scenarios.

**Live app:** https://lepti99-tech.github.io/swiss-map-app/

## Features

- Official swisstopo map of Switzerland with a 4 × 4 km grid overlay
- Click a square to color it; click again to remove it
- Six colors to choose from
- Counter showing how many squares are selected
- Scenarios: save your squares under a name, then load, rename or delete them later
- Changes to the active scenario are saved automatically
- Squares selected without a scenario can be taken over into a new scenario
- Download a scenario as a JSON file and upload it again later (also in another browser or on another device)

## Privacy and storage

Scenarios are stored only in your own browser (`localStorage`). Nothing is sent to a server, and other users cannot see your scenarios. Clearing your browser data deletes them.

To keep a backup, or to move a scenario to another browser or device, use **Download scenario** and later **Load existing scenario → Upload from file**.

## Scenario file format

Downloaded scenarios are JSON files:

```json
{
  "app": "swiss-grid-app",
  "formatVersion": 1,
  "name": "My scenario",
  "gridSize": 4000,
  "exportedAt": "2026-11-16T12:00:00.000Z",
  "squares": [
    ["2600/1200", "col1"],
    ["2604/1200", "col3"]
  ]
}
```

Each square is stored as `[id, colorId]`. The ID is the lower-left corner of the square in kilometres (Swiss coordinates, EPSG:2056), the color IDs are defined in `js/config.js`.

## Run locally

Requires [Python 3](https://www.python.org/) and an internet connection (the map tiles and libraries are loaded online).

1. Double-click `start-server.bat` (Windows), or run `python -m http.server 8000` in the project folder.
2. Open http://localhost:8000 in your browser.

The app must be served through a local web server; opening `index.html` directly does not work because it uses JavaScript modules.

## Project structure

```
swiss-map-app/
├── index.html          Main HTML page
├── style.css           Styling
├── start-server.bat    Starts a local web server (Windows)
├── BACKLOG.md          Open change proposals
└── js/
    ├── main.js         App start and coordination
    ├── config.js       Constants and configuration
    ├── map.js          Map initialization and layers
    ├── grid.js         Grid drawing
    ├── selection.js    Square selection
    ├── storage.js      Scenario management (localStorage)
    ├── fileio.js       Download and upload of scenario files
    └── ui.js           Menu, info button and pop-ups
```

## Built with

- [OpenLayers](https://openlayers.org/) – map display
- [proj4js](https://github.com/proj4js/proj4js) – Swiss coordinate system (EPSG:2056)
- Map data © [swisstopo](https://www.swisstopo.admin.ch/)
