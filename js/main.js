// Main file: coordinates all modules and starts the app

import { initMap, map } from './map.js';
import { setupGridUpdates } from './grid.js';
import { toggleSquare } from './selection.js';
import { createMenu, updateSquareCountDisplay } from './ui.js';

// Initialize app
function initApp() {
  // Initialize map
  initMap();

  // Set up grid updates
  setupGridUpdates();
 
  // Create menu
  createMenu();
  
  // Click event on the map
  map.on("click", function (event) {
    const coordinate = event.coordinate;
    const [x, y] = coordinate;

    toggleSquare(x, y);
    updateSquareCountDisplay();
  });
}

// Start app as soon as the DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
