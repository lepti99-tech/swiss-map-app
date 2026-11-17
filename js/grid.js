// Grid drawing and updating

import { DEFAULT_GRID_SIZE, GRID_ORIGIN, GRID_BOUNDS } from './config.js';
import { map, gridSource } from './map.js';

// Current square size in meters (4000, 5000, 10000 or 20000)
let gridSize = DEFAULT_GRID_SIZE;

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

// Grid boundaries for the current square size.
// GRID_BOUNDS is widened outwards to the nearest square edge, so that the
// boundaries always lie on grid lines (needed for 5, 10 and 20 km).
export function getGridBounds() {
  const [originX, originY] = GRID_ORIGIN;
  const down = (value, origin) => origin + Math.floor((value - origin) / gridSize) * gridSize;
  const up = (value, origin) => origin + Math.ceil((value - origin) / gridSize) * gridSize;

  return {
    minX: down(GRID_BOUNDS.minX, originX),
    maxX: up(GRID_BOUNDS.maxX, originX),
    minY: down(GRID_BOUNDS.minY, originY),
    maxY: up(GRID_BOUNDS.maxY, originY)
  };
}

// Update grid based on the current view
export function updateGrid() {
  gridSource.clear();

  const view = map.getView();
  const extent = view.calculateExtent(map.getSize());

  const [minX, minY, maxX, maxY] = extent;
  const [originX, originY] = GRID_ORIGIN;
  const bounds = getGridBounds();

  // Calculate start lines (left/bottom of the view)
  const startX = originX + Math.floor((minX - originX) / gridSize) * gridSize;
  const startY = originY + Math.floor((minY - originY) / gridSize) * gridSize;

  // Vertical lines (only within the boundaries)
  for (let x = startX; x <= maxX; x += gridSize) {
    if (x >= bounds.minX && x <= bounds.maxX) {
      const line = new ol.geom.LineString([
        [x, Math.max(minY, bounds.minY)],
        [x, Math.min(maxY, bounds.maxY)]
      ]);
      gridSource.addFeature(new ol.Feature(line));
    }
  }

  // Horizontal lines (only within the boundaries)
  for (let y = startY; y <= maxY; y += gridSize) {
    if (y >= bounds.minY && y <= bounds.maxY) {
      const line = new ol.geom.LineString([
        [Math.max(minX, bounds.minX), y],
        [Math.min(maxX, bounds.maxX), y]
      ]);
      gridSource.addFeature(new ol.Feature(line));
    }
  }
}

// Register event listener for grid updates
export function setupGridUpdates() {
  map.getView().on("change:resolution", updateGrid);
  map.getView().on("change:center", updateGrid);

  // Draw initial grid
  updateGrid();
}
