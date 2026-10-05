// Configuration and constants

export const RESOLUTIONS = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250,
  1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25, 0.1
];

export const EXTENT = [2420000, 1030000, 2900000, 1350000];

// Grid settings
export const GRID_SIZE = 4000; // 4 km in meters
export const GRID_ORIGIN = [2600000, 1200000];

// Grid boundaries
export const GRID_BOUNDS = {
  minX: 2484000,
  maxX: 2836000,
  minY: 1072000,
  maxY: 1296000
};

// Projection for the Swiss coordinate system
export const PROJECTION_CODE = "EPSG:2056";
export const PROJECTION_DEF =
  "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs";

// Map layer configuration
export const PIXELKARTE_CONFIG = {
  attribution: "swisstopo",
  format: "jpeg",
  serverLayerName: "ch.swisstopo.pixelkarte-farbe",
  attributionUrl: "https://www.swisstopo.admin.ch/",
  label: "Pixelkarte"
};

// Color palette for square selection
// Extensible: simply append another object with a new ID.
export const COLORS = {
  col1: { label: "Red",       fill: "rgba(255, 0, 0, 0.3)",   stroke: "rgba(255, 0, 0, 0.7)" },
  col2: { label: "Dark red",  fill: "rgba(139, 0, 0, 0.3)",   stroke: "rgba(139, 0, 0, 0.7)" },
  col3: { label: "Grey",      fill: "rgba(128, 128, 128, 0.4)", stroke: "rgba(128, 128, 128, 0.7)" },
  col4: { label: "Yellow",    fill: "rgba(255, 215, 0, 0.3)", stroke: "rgba(255, 215, 0, 0.7)" },
  col5: { label: "Orange",    fill: "rgba(255, 140, 0, 0.3)", stroke: "rgba(255, 140, 0, 0.7)" },
  col6: { label: "Blue",      fill: "rgba(0, 153, 255, 0.3)",   stroke: "rgba(0, 0, 255, 0.7)" }
};

// Default color, active on app start and when loading a new scenario
export const DEFAULT_COLOR_ID = "col1";