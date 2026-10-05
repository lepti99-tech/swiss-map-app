// Square selection and management

import { GRID_SIZE, GRID_ORIGIN, GRID_BOUNDS, DEFAULT_COLOR_ID } from './config.js';
import { selectedSquaresSource } from './map.js';
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
  const gridX =
    Math.floor((x - GRID_ORIGIN[0]) / GRID_SIZE) * GRID_SIZE + GRID_ORIGIN[0];
  const gridY =
    Math.floor((y - GRID_ORIGIN[1]) / GRID_SIZE) * GRID_SIZE + GRID_ORIGIN[1];

  const idX = Math.floor(gridX / 1000);
  const idY = Math.floor(gridY / 1000);

  return `${idX}/${idY}`;
}

// Calculates the lower-left corner of a square
export function getSquareCoordinates(x, y) {
  const gridX =
    Math.floor((x - GRID_ORIGIN[0]) / GRID_SIZE) * GRID_SIZE + GRID_ORIGIN[0];
  const gridY =
    Math.floor((y - GRID_ORIGIN[1]) / GRID_SIZE) * GRID_SIZE + GRID_ORIGIN[1];

  return [gridX, gridY];
}

// Calculates the lower-left corner of a square directly from an ID ("idX/idY")
function getSquareCoordinatesFromId(id) {
  const [idX, idY] = id.split('/').map(Number);
  const gridX = idX * 1000;
  const gridY = idY * 1000;
  return [gridX, gridY];
}

// Creates a polygon for a square (based on click coordinates)
export function createSquarePolygon(x, y) {
  const [gridX, gridY] = getSquareCoordinates(x, y);
  return createSquarePolygonFromCorner(gridX, gridY);
}

// Creates a polygon directly from the lower-left corner
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

// Checks whether coordinates lie within the grid boundaries
export function isWithinBounds(x, y) {
  const [gridX, gridY] = getSquareCoordinates(x, y);

  return (
    gridX >= GRID_BOUNDS.minX &&
    gridX < GRID_BOUNDS.maxX &&
    gridY >= GRID_BOUNDS.minY &&
    gridY < GRID_BOUNDS.maxY
  );
}

// Returns the current selection as an array of [id, color] pairs
function getSquaresAsArray() {
  return Object.keys(selectedSquares).map((id) => [
    id,
    selectedSquares[id].color || DEFAULT_COLOR_ID
  ]);
}

// Toggles a square on/off
export function toggleSquare(x, y) {
  if (!isWithinBounds(x, y)) {
    return; // Outside the boundaries, do nothing
  }

  const id = getSquareId(x, y);

  if (selectedSquares[id]) {
    // Square is already selected → remove it
    const feature = selectedSquares[id].feature;
    selectedSquaresSource.removeFeature(feature);
    delete selectedSquares[id];
    console.log(`Square ${id} removed`);
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
    console.log(`Square ${id} added with color ${currentColor}`);
  }

  // Automatically save to the active scenario
  updateActiveScenario(getSquaresAsArray());
}

// Remove all squares (visual/local only, does not trigger saving)
export function clearAllSquares() {
  selectedSquaresSource.clear();
  for (let id in selectedSquares) {
    delete selectedSquares[id];
  }
}

// Loads a given list of [id, color] pairs and displays them on the map.
// Called when a scenario is loaded.
export function loadSquares(squares) {
  // First reset the current selection
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

  console.log(`Scenario loaded: ${squares.length} square(s) displayed.`);
}