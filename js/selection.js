// Quadrat-Auswahl und -Verwaltung

import { GRID_SIZE, GRID_ORIGIN, GRID_BOUNDS, DEFAULT_COLOR_ID } from './config.js';
import { selectedSquaresSource } from './map.js';
import { updateActiveScenario } from './storage.js';

// Speichert die ausgewählten Quadrate
export const selectedSquares = {};

// Aktuell gewählte Farbe (wird beim Setzen eines neuen Quadrats verwendet)
let currentColor = DEFAULT_COLOR_ID;

// Setzt die aktuell aktive Farbe (wird von ui.js beim Klick auf einen Farbkreis aufgerufen)
export function setCurrentColor(colorId) {
  currentColor = colorId;
}

// Gibt die aktuell aktive Farbe zurück (z. B. damit ui.js den Kreis markieren kann)
export function getCurrentColor() {
  return currentColor;
}

// Setzt die aktuelle Farbe auf den Standardwert zurück
// (wird beim Start eines neuen Szenarios und beim Laden eines Szenarios aufgerufen)
export function resetCurrentColor() {
  currentColor = DEFAULT_COLOR_ID;
}

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

// Berechnet die untere linke Ecke eines Quadrats direkt aus einer ID ("idX/idY")
function getSquareCoordinatesFromId(id) {
  const [idX, idY] = id.split('/').map(Number);
  const gridX = idX * 1000;
  const gridY = idY * 1000;
  return [gridX, gridY];
}

// Erstellt ein Polygon für ein Quadrat (basierend auf Klick-Koordinaten)
export function createSquarePolygon(x, y) {
  const [gridX, gridY] = getSquareCoordinates(x, y);
  return createSquarePolygonFromCorner(gridX, gridY);
}

// Erstellt ein Polygon direkt aus der unteren linken Ecke
function createSquarePolygonFromCorner(gridX, gridY) {
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

// Gibt die aktuelle Auswahl als Array von [id, color]-Paaren zurück
function getSquaresAsArray() {
  return Object.keys(selectedSquares).map((id) => [
    id,
    selectedSquares[id].color || DEFAULT_COLOR_ID
  ]);
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
    // Quadrat ist noch nicht ausgewählt → hinzufügen, mit aktuell gewählter Farbe
    const polygon = createSquarePolygon(x, y);
    const feature = new ol.Feature(polygon);
    feature.setId(id);
    feature.set('colorId', currentColor);

    selectedSquaresSource.addFeature(feature);
    selectedSquares[id] = {
      feature: feature,
      visited: true,
      color: currentColor
    };
    console.log(`Quadrat ${id} hinzugefügt mit Farbe ${currentColor}`);
  }

  // Automatisches Speichern im aktiven Szenario
  updateActiveScenario(getSquaresAsArray());
}

// Alle Quadrate entfernen (nur visuell/lokal, ohne Speicherung auszulösen)
export function clearAllSquares() {
  selectedSquaresSource.clear();
  for (let id in selectedSquares) {
    delete selectedSquares[id];
  }
}

// Lädt eine gegebene Liste von [id, color]-Paaren und stellt sie auf der Karte dar.
// Wird beim Laden eines Szenarios aufgerufen.
export function loadSquares(squares) {
  // Zuerst aktuelle Auswahl zurücksetzen
  clearAllSquares();

  squares.forEach(([id, color]) => {
    const [gridX, gridY] = getSquareCoordinatesFromId(id);
    const polygon = createSquarePolygonFromCorner(gridX, gridY);
    const feature = new ol.Feature(polygon);
    feature.setId(id);
    feature.set('colorId', color || DEFAULT_COLOR_ID);

    selectedSquaresSource.addFeature(feature);
    selectedSquares[id] = {
      feature: feature,
      visited: true,
      color: color || DEFAULT_COLOR_ID
    };
  });

  console.log(`Szenario geladen: ${squares.length} Quadrat(e) dargestellt.`);
}