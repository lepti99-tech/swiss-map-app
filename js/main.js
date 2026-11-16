// Main file: coordinates all modules and starts the app

import { initMap, map } from './map.js';
import { setupGridUpdates } from './grid.js';
import { toggleSquare } from './selection.js';
import { createMenu, updateSquareCountDisplay, showNoScenarioHintOnce } from './ui.js';

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

    if (toggleSquare(x, y)) {
      updateSquareCountDisplay();
      showNoScenarioHintOnce(); // only shown if no scenario is active
    }
  });
}

// Start app as soon as the DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
