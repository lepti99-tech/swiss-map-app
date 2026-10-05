// Grid drawing and updating

import { GRID_SIZE, GRID_ORIGIN, GRID_BOUNDS } from './config.js';
import { map, gridSource } from './map.js';

// Update grid based on the current view
export function updateGrid() {
  gridSource.clear();

  const view = map.getView();
  const extent = view.calculateExtent(map.getSize());

  const [minX, minY, maxX, maxY] = extent;
  const [originX, originY] = GRID_ORIGIN;

  // Calculate start lines (left/bottom of the view)
  let startX =
    originX + Math.floor((minX - originX) / GRID_SIZE) * GRID_SIZE;

  let startY =
    originY + Math.floor((minY - originY) / GRID_SIZE) * GRID_SIZE;

  // Calculate end points
  let endX = maxX;
  let endY = maxY;

  // Vertical lines (only within the boundaries)
  for (let x = startX; x <= endX; x += GRID_SIZE) {
    // Only draw lines that lie within the defined boundaries
    if (x >= GRID_BOUNDS.minX && x <= GRID_BOUNDS.maxX) {
      const line = new ol.geom.LineString([
        [x, Math.max(minY, GRID_BOUNDS.minY)],
        [x, Math.min(maxY, GRID_BOUNDS.maxY)]
      ]);
      gridSource.addFeature(new ol.Feature(line));
    }
  }

  // Horizontal lines (only within the boundaries)
  for (let y = startY; y <= endY; y += GRID_SIZE) {
    // Only draw lines that lie within the defined boundaries
    if (y >= GRID_BOUNDS.minY && y <= GRID_BOUNDS.maxY) {
      const line = new ol.geom.LineString([
        [Math.max(minX, GRID_BOUNDS.minX), y],
        [Math.min(maxX, GRID_BOUNDS.maxX), y]
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
