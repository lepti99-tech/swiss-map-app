// Quadrat-Auswahl und -Verwaltung

import { GRID_SIZE, GRID_ORIGIN, GRID_BOUNDS } from './config.js';
import { selectedSquaresSource } from './map.js';

// Speichert die ausgewählten Quadrate
export const selectedSquares = {};

// Berechnet die ID eines Quadrats basierend auf Koordinaten
export function getSquareId(x, y) {
  const gridX =
    Math.floor((x - GRID_ORIGIN[0]) / GRID_SIZE) * GRID_SIZE + GRID_ORIGIN[0];
  const gridY =
    Math.floor((y - GRID_ORIGIN[1]) / GRID_SIZE) * GRID_SIZE + GRID_ORIGIN[1];

  const idX = Math.floor(gridX / 1000);
  const idY = Math.floor(gridY / 1000);

  return `${idX}/${idY}`;
}

// Berechnet die untere linke Ecke eines Quadrats
export function getSquareCoordinates(x, y) {
  const gridX =
    Math.floor((x - GRID_ORIGIN[0]) / GRID_SIZE) * GRID_SIZE + GRID_ORIGIN[0];
  const gridY =
    Math.floor((y - GRID_ORIGIN[1]) / GRID_SIZE) * GRID_SIZE + GRID_ORIGIN[1];

  return [gridX, gridY];
}

// Erstellt ein Polygon für ein Quadrat
export function createSquarePolygon(x, y) {
  const [gridX, gridY] = getSquareCoordinates(x, y);

  const coordinates = [
    [
      [gridX, gridY],
      [gridX + GRID_SIZE, gridY],
      [gridX + GRID_SIZE, gridY + GRID_SIZE],
      [gridX, gridY + GRID_SIZE],
      [gridX, gridY]
    ]
  ];

  return new ol.geom.Polygon(coordinates);
}

// Prüft, ob Koordinaten innerhalb der Raster-Grenzen liegen
export function isWithinBounds(x, y) {
  const [gridX, gridY] = getSquareCoordinates(x, y);

  return (
    gridX >= GRID_BOUNDS.minX &&
    gridX < GRID_BOUNDS.maxX &&
    gridY >= GRID_BOUNDS.minY &&
    gridY < GRID_BOUNDS.maxY
  );
}

// Schaltet ein Quadrat ein/aus
export function toggleSquare(x, y) {
  if (!isWithinBounds(x, y)) {
    return; // Außerhalb der Grenzen, nichts tun
  }

  const id = getSquareId(x, y);

  if (selectedSquares[id]) {
    // Quadrat ist bereits ausgewählt → entfernen
    const feature = selectedSquares[id].feature;
    selectedSquaresSource.removeFeature(feature);
    delete selectedSquares[id];
    console.log(`Quadrat ${id} entfernt`);
  } else {
    // Quadrat ist noch nicht ausgewählt → hinzufügen
    const polygon = createSquarePolygon(x, y);
    const feature = new ol.Feature(polygon);
    feature.setId(id);

    selectedSquaresSource.addFeature(feature);
    selectedSquares[id] = {
      feature: feature,
      visited: true
    };
    console.log(`Quadrat ${id} hinzugefügt`);
  }
}

// Alle Quadrate entfernen
export function clearAllSquares() {
  selectedSquaresSource.clear();
  for (let id in selectedSquares) {
    delete selectedSquares[id];
  }
}
