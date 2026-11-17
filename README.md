# Swiss Grid App

An interactive map of Switzerland with a grid of squares (4, 5, 10 or 20 km). Click squares to color them and save your selections as named scenarios.

**Live app:** https://lepti99-tech.github.io/swiss-map-app/

## Features

- Official swisstopo map of Switzerland with a grid overlay
- Only squares that touch Swiss territory are shown (border lakes up to the border; Liechtenstein counts as abroad)
- Square size of 4, 5, 10 or 20 km, chosen per scenario (slider in the menu when no scenario is active)
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

`gridSize` is the square size in metres (4000, 5000, 10000 or 20000; files without it count as 4000). Each square is stored as `[id, colorId]`. The ID is the lower-left corner of the square in kilometres (Swiss coordinates, EPSG:2056), the color IDs are defined in `js/config.js`.

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
    ├── swiss-squares.js  Generated list of squares that touch Switzerland
    └── ui.js           Menu, info button and pop-ups
tools/
└── build_swiss_squares.py  Generates js/swiss-squares.js from swisstopo data
```

## Swiss squares (`js/swiss-squares.js`)

The list of valid squares per square size is generated once from the official Swiss
border (swissBOUNDARIES3D by swisstopo; Lake Constance up to the middle of the lake) and committed. A square
is included if any part of its area lies in Switzerland. To regenerate it, download the
GeoPackage as described at the top of `tools/build_swiss_squares.py`, unzip it into
`tools/data/` (not committed) and run `python tools/build_swiss_squares.py`.
Manual corrections go into `MANUAL_ADD` / `MANUAL_REMOVE` in the script.

## Built with

- [OpenLayers](https://openlayers.org/) – map display
- [proj4js](https://github.com/proj4js/proj4js) – Swiss coordinate system (EPSG:2056)
- Map data © [swisstopo](https://www.swisstopo.admin.ch/)
