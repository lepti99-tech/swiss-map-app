// Haupt-Datei: Koordiniert alle Module und startet die App

import { initMap, map } from './map.js';
import { setupGridUpdates } from './grid.js';
import { toggleSquare } from './selection.js';
import { createMenu } from './ui.js';

// App initialisieren
function initApp() {
  console.log("Swiss Map App wird gestartet...");

  // Karte initialisieren
  initMap();

  // Raster-Updates einrichten
  setupGridUpdates();
 
  // Menü erstellen
  createMenu();
  
  // Click-Event auf der Karte
  map.on("click", function (event) {
    const coordinate = event.coordinate;
    const [x, y] = coordinate;

    toggleSquare(x, y);
  });

  console.log("Swiss Map App erfolgreich gestartet!");
}

// App starten, sobald das DOM geladen ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
