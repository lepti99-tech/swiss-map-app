// Grid drawing and the list of valid squares.
// Only squares that touch Switzerland exist (see js/swiss-squares.js).

import { DEFAULT_GRID_SIZE } from './config.js';
import { gridSource } from './map.js';
import { SWISS_SQUARES } from './swiss-squares.js';

// Current square size in meters (4000, 5000, 10000 or 20000)
let gridSize = DEFAULT_GRID_SIZE;

// Square IDs per size as a Set, for fast lookups (created on first use)
const swissSquareSets = {};

function getSwissSquareSet(size) {
  if (!swissSquareSets[size]) {
    swissSquareSets[size] = new Set(SWISS_SQUARES[size] || []);
  }
  return swissSquareSets[size];
}

// Returns the current square size in meters
export function getGridSize() {
  return gridSize;
}

// Sets the square size and redraws the grid
export function setGridSize(size) {
  if (size === gridSize) return;
  gridSize = size;
  updateGrid();
}

// True if the square with this ID touches Switzerland (for the given size)
export function isSwissSquare(id, size = gridSize) {
  return getSwissSquareSet(size).has(id);
}

// Removes squares that do not touch Switzerland from a list of [id, color] pairs
export function filterSwissSquares(squares, size = gridSize) {
  return squares.filter(([id]) => isSwissSquare(id, size));
}

// Lower-left corner in meters from an ID ("idX/idY" in km)
export function getCornerFromId(id) {
  const [idX, idY] = id.split('/').map(Number);
  return [idX * 1000, idY * 1000];
}

// Polygon of a square from its lower-left corner (current size)
export function createSquarePolygonFromCorner(gridX, gridY) {
  return new ol.geom.Polygon([[
    [gridX, gridY],
    [gridX + gridSize, gridY],
    [gridX + gridSize, gridY + gridSize],
    [gridX, gridY + gridSize],
    [gridX, gridY]
  ]]);
}

// Draws the outline of every Swiss square for the current size.
// Called on start and whenever the size changes (not on every pan/zoom).
export function updateGrid() {
  gridSource.clear();

  const features = (SWISS_SQUARES[gridSize] || []).map((id) => {
    const [gridX, gridY] = getCornerFromId(id);
    return new ol.Feature(createSquarePolygonFromCorner(gridX, gridY));
  });

  gridSource.addFeatures(features);
}
