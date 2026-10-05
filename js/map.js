// Map initialization and layer management

import {
  RESOLUTIONS,
  EXTENT,
  PROJECTION_CODE,
  PROJECTION_DEF,
  PIXELKARTE_CONFIG,
  COLORS,
  DEFAULT_COLOR_ID
} from './config.js';

// Global variables
export let map;
export let gridSource;
export let gridLayer;
export let selectedSquaresSource;
export let selectedSquaresLayer;

// Register projection
function setupProjection() {
  const olProj4 = ol.proj.proj4;
  proj4.defs(PROJECTION_CODE, PROJECTION_DEF);
  olProj4.register(proj4);

  const projection = ol.proj.get(PROJECTION_CODE);
  projection.setExtent(EXTENT);
  return projection;
}

// Create WMTS layer
function createWMTSLayer(layerConfig, projection) {
  const matrixIds = RESOLUTIONS.map((_, i) => i.toString());

  return new ol.layer.Tile({
    source: new ol.source.WMTS({
      layer: layerConfig.serverLayerName,
      crossOrigin: "anonymous",
      url:
        "https://wmts.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg",
      projection: projection,
      matrixSet: "swissgrid",
      format: layerConfig.format,
      tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(EXTENT),
        extent: EXTENT,
        resolutions: RESOLUTIONS,
        matrixIds: matrixIds
      }),
      requestEncoding: "REST"
    })
  });
}

// Create grid layer
function createGridLayer() {
  gridSource = new ol.source.Vector();

  gridLayer = new ol.layer.Vector({
    source: gridSource,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "rgba(0, 0, 139, 0.7)", // dark blue
        width: 1.5
      })
    })
  });

  return gridLayer;
}

// Precomputed styles per color ID, so that no new style object
// has to be created on every render.
const squareStyles = {};
function getSquareStyle(colorId) {
  const colorDef = COLORS[colorId] || COLORS[DEFAULT_COLOR_ID];
  const key = colorId && COLORS[colorId] ? colorId : DEFAULT_COLOR_ID;

  if (!squareStyles[key]) {
    squareStyles[key] = new ol.style.Style({
      fill: new ol.style.Fill({
        color: colorDef.fill
      }),
      stroke: new ol.style.Stroke({
        color: colorDef.stroke,
        width: 2
      })
    });
  }

  return squareStyles[key];
}

// Create layer for filled squares
function createSelectedSquaresLayer() {
  selectedSquaresSource = new ol.source.Vector();

  selectedSquaresLayer = new ol.layer.Vector({
    source: selectedSquaresSource,
    // Style function instead of a fixed style: reads the color ID from the feature
    style: (feature) => getSquareStyle(feature.get('colorId'))
  });

  return selectedSquaresLayer;
}

// Initialize map
export function initMap() {
  const projection = setupProjection();
  const wmtsLayer = createWMTSLayer(PIXELKARTE_CONFIG, projection);
  const gridLayer = createGridLayer();
  const squaresLayer = createSelectedSquaresLayer();

  map = new ol.Map({
    target: "map",
    layers: [wmtsLayer],
    view: new ol.View({
      center: [2660000, 1190000],
      projection: projection,
      resolution: 10,
      extent: EXTENT
    }),
    logo: false
  });

  map.addLayer(gridLayer);
  map.addLayer(squaresLayer);

  return map;
}