# Swiss Map App - Modulare Struktur

## Ordnerstruktur

```
swiss-map-app/
├── index.html          (Haupt-HTML-Datei)
├── style.css           (Styling)
├── start-server.bat    (Server-Start-Script - aus deinem Original-Ordner kopieren!)
└── js/
    ├── main.js         (App-Start & Koordination)
    ├── config.js       (Konstanten & Konfiguration)
    ├── map.js          (Karten-Initialisierung & Layer)
    ├── grid.js         (Raster-Zeichnung)
    ├── selection.js    (Quadrat-Auswahl)
    ├── storage.js      (Szenario-Verwaltung - kommt im nächsten Schritt)
    └── ui.js           (UI-Event-Handler - kommt im nächsten Schritt)
```

## Installation

1. Kopiere alle Dateien in deinen Projekt-Ordner
2. Kopiere deine `start-server.bat` in den Haupt-Ordner (swiss-map-app/)
3. Starte den Server mit Doppelklick auf `start-server.bat`
4. Öffne http://localhost:8000 im Browser

## Was wurde geändert?

### Strukturelle Änderungen:
- Code in 6 Module aufgeteilt (bessere Übersicht)
- ES6 Modules verwendet (import/export)
- Eine Zeile in index.html geändert: `<script type="module" src="js/main.js"></script>`

### Funktionalität:
- **KEINE Änderungen!** Die App funktioniert exakt wie vorher
- Raster wird angezeigt
- Quadrate können angeklickt und rot eingefärbt werden
- Alles sollte identisch aussehen und funktionieren

## Nächste Schritte

Im nächsten Schritt werden wir hinzufügen:
- Jahr-Eingabefeld
- Szenario-Verwaltung (Neu/Laden/Löschen)
- localStorage für permanente Speicherung
