// Konfiguration und Konstanten

export const RESOLUTIONS = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250,
  1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25, 0.1
];

export const EXTENT = [2420000, 1030000, 2900000, 1350000];

// Raster-Einstellungen
export const GRID_SIZE = 4000; // 4 km in Metern
export const GRID_ORIGIN = [2600000, 1200000];

// Raster-Begrenzungen
export const GRID_BOUNDS = {
  minX: 2484000,
  maxX: 2836000,
  minY: 1072000,
  maxY: 1296000
};

// Projektion für Schweizer Koordinatensystem
export const PROJECTION_CODE = "EPSG:2056";
export const PROJECTION_DEF =
  "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs";

// Karten-Layer Konfiguration
export const PIXELKARTE_CONFIG = {
  attribution: "swisstopo",
  format: "jpeg",
  serverLayerName: "ch.swisstopo.pixelkarte-farbe",
  attributionUrl: "https://www.swisstopo.admin.ch/",
  label: "Pixelkarte"
};
