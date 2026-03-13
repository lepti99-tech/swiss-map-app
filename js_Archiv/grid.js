// Raster-Zeichnung und -Aktualisierung

import { GRID_SIZE, GRID_ORIGIN, GRID_BOUNDS } from './config.js';
import { map, gridSource } from './map.js';

// Raster aktualisieren basierend auf View
export function updateGrid() {
  gridSource.clear();

  const view = map.getView();
  const extent = view.calculateExtent(map.getSize());

  const [minX, minY, maxX, maxY] = extent;
  const [originX, originY] = GRID_ORIGIN;

  // Startlinien berechnen (links/unten vom View)
  let startX =
    originX + Math.floor((minX - originX) / GRID_SIZE) * GRID_SIZE;

  let startY =
    originY + Math.floor((minY - originY) / GRID_SIZE) * GRID_SIZE;

  // Endpunkte berechnen
  let endX = maxX;
  let endY = maxY;

  // Vertikale Linien (nur innerhalb der Grenzen)
  for (let x = startX; x <= endX; x += GRID_SIZE) {
    // Nur Linien zeichnen, die innerhalb der definierten Grenzen liegen
    if (x >= GRID_BOUNDS.minX && x <= GRID_BOUNDS.maxX) {
      const line = new ol.geom.LineString([
        [x, Math.max(minY, GRID_BOUNDS.minY)],
        [x, Math.min(maxY, GRID_BOUNDS.maxY)]
      ]);
      gridSource.addFeature(new ol.Feature(line));
    }
  }

  // Horizontale Linien (nur innerhalb der Grenzen)
  for (let y = startY; y <= endY; y += GRID_SIZE) {
    // Nur Linien zeichnen, die innerhalb der definierten Grenzen liegen
    if (y >= GRID_BOUNDS.minY && y <= GRID_BOUNDS.maxY) {
      const line = new ol.geom.LineString([
        [Math.max(minX, GRID_BOUNDS.minX), y],
        [Math.min(maxX, GRID_BOUNDS.maxX), y]
      ]);
      gridSource.addFeature(new ol.Feature(line));
    }
  }
}

// Event-Listener für Raster-Updates registrieren
export function setupGridUpdates() {
  map.getView().on("change:resolution", updateGrid);
  map.getView().on("change:center", updateGrid);
  
  // Initiales Raster zeichnen
  updateGrid();
}
