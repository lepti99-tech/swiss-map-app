// Square selection and management

import { GRID_ORIGIN, DEFAULT_COLOR_ID } from './config.js';
import { selectedSquaresSource } from './map.js';
import {
  getGridSize, isSwissSquare, getCornerFromId, createSquarePolygonFromCorner
} from './grid.js';
import { updateActiveScenario } from './storage.js';

// Stores the selected squares
export const selectedSquares = {};

// Currently selected color (used when a new square is added)
let currentColor = DEFAULT_COLOR_ID;

// Sets the active color (called by ui.js when a color circle is clicked)
export function setCurrentColor(colorId) {
  currentColor = colorId;
}

// Returns the active color (e.g. so ui.js can highlight the circle)
export function getCurrentColor() {
  return currentColor;
}

// Resets the current color to the default
// (called when starting a new scenario and when loading a scenario)
export function resetCurrentColor() {
  currentColor = DEFAULT_COLOR_ID;
}

// Calculates the ID of a square from coordinates
export function getSquareId(x, y) {
  const [gridX, gridY] = getSquareCoordinates(x, y);

  const idX = Math.floor(gridX / 1000);
  const idY = Math.floor(gridY / 1000);

  return `${idX}/${idY}`;
}

// Calculates the lower-left corner of a square
export function getSquareCoordinates(x, y) {
  const size = getGridSize();
  const gridX =
    Math.floor((x - GRID_ORIGIN[0]) / size) * size + GRID_ORIGIN[0];
  const gridY =
    Math.floor((y - GRID_ORIGIN[1]) / size) * size + GRID_ORIGIN[1];

  return [gridX, gridY];
}

// Creates a polygon for a square (based on click coordinates)
export function createSquarePolygon(x, y) {
  const [gridX, gridY] = getSquareCoordinates(x, y);
  return createSquarePolygonFromCorner(gridX, gridY);
}

// Returns the current selection as an array of [id, color] pairs
export function getSquaresAsArray() {
  return Object.keys(selectedSquares).map((id) => [
    id,
    selectedSquares[id].color || DEFAULT_COLOR_ID
  ]);
}

// Toggles a square on/off.
// Returns true if a square was added or removed, false if the click was outside the grid
// (i.e. on a square that does not touch Switzerland).
export function toggleSquare(x, y) {
  const id = getSquareId(x, y);

  if (!isSwissSquare(id)) {
    return false; // Not a Swiss square, do nothing
  }

  if (selectedSquares[id]) {
    // Square is already selected → remove it
    const feature = selectedSquares[id].feature;
    selectedSquaresSource.removeFeature(feature);
    delete selectedSquares[id];
  } else {
    // Square is not selected yet → add it with the current color
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
  }

  // Automatically save to the active scenario
  updateActiveScenario(getSquaresAsArray());
  return true;
}

// Remove all squares (visual/local only, does not trigger saving)
export function clearAllSquares() {
  selectedSquaresSource.clear();
  for (let id in selectedSquares) {
    delete selectedSquares[id];
  }
}

// Loads a given list of [id, color] pairs and displays them on the map.
// Called when a scenario is loaded. Squares that do not touch Switzerland are
// skipped; they disappear from the scenario the next time it is saved.
export function loadSquares(squares) {
  // First reset the current selection
  clearAllSquares();

  squares.forEach(([id, color]) => {
    if (!isSwissSquare(id)) return;

    const [gridX, gridY] = getCornerFromId(id);
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
}